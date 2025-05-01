import { Injectable } from '@angular/core';
import { Database, ref, set, get, onValue, push, update, remove, DataSnapshot } from '@angular/fire/database';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { OnlineGame, GameState, GameMove, GamePlayer, GameStatus, PlayerColor } from '../models/online-game.model';

@Injectable({
  providedIn: 'root'
})
export class OnlineGameService {
  private currentGameState = new BehaviorSubject<GameState | null>(null);
  private gameRef: any = null;

  constructor(private db: Database) {}

  // Generate a random game code
  private generateGameCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Create a new game
  async createGame(playerName: string): Promise<string> {
    const gameCode = this.generateGameCode();
    const gameId = push(ref(this.db, 'games')).key;
    const newGame: OnlineGame = {
      id: gameId!,
      board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Initial chess position
      currentPlayer: 'white',
      status: 'waiting',
      whitePlayer: playerName,
      blackPlayer: null,
      createdAt: Date.now(),
      lastMoveAt: Date.now(),
      gameCode
    };

    await set(ref(this.db, `games/${gameId}`), newGame);
    return gameCode;
  }

  // Join an existing game
  async joinGame(gameCode: string, playerName: string): Promise<boolean> {
    const gamesRef = ref(this.db, 'games');
    const snapshot = await get(gamesRef);
    const games = snapshot.val() || {};

    const gameEntry = Object.entries(games).find(([_, game]: [string, any]) => {
      const gameData = game as OnlineGame;
      return gameData.gameCode === gameCode && gameData.status === 'waiting';
    });

    if (!gameEntry) {
      return false;
    }

    const [gameId, game] = gameEntry;
    const gameData = game as OnlineGame;
    const updates: any = {};

    if (!gameData.whitePlayer) {
      updates[`games/${gameId}/whitePlayer`] = playerName;
    } else if (!gameData.blackPlayer) {
      updates[`games/${gameId}/blackPlayer`] = playerName;
      updates[`games/${gameId}/status`] = 'playing';
    }

    await update(ref(this.db), updates);
    return true;
  }

  // Listen to game state changes
  listenToGame(gameCode: string): Observable<GameState | null> {
    const gamesRef = ref(this.db, 'games');
    console.log('Setting up onValue listener for /games');
    return new Observable(subscriber => {
      onValue(gamesRef, (snapshot: DataSnapshot) => {
        console.log('onValue callback triggered');
        const games = snapshot.val() || {};
        console.log('Looking for gameCode:', gameCode);
        console.log('Available games:', Object.values(games).map((g: any) => g.gameCode));
        const gameEntry = Object.entries(games).find(([_, game]: [string, any]) => {
          const gameData = game as OnlineGame;
          return gameData.gameCode === gameCode;
        });

        if (gameEntry) {
          const [gameId, game] = gameEntry;
          const gameData = game as OnlineGame;
          const gameState: GameState = {
            game: gameData,
            players: {
              white: gameData.whitePlayer ? { 
                id: gameData.whitePlayer, 
                name: gameData.whitePlayer, 
                color: 'white', 
                isReady: true 
              } : null,
              black: gameData.blackPlayer ? { 
                id: gameData.blackPlayer, 
                name: gameData.blackPlayer, 
                color: 'black', 
                isReady: true 
              } : null
            },
            moves: []
          };
          subscriber.next(gameState);
        } else {
          subscriber.next(null);
        }
      });
    });
  }

  // Make a move in the game
  async makeMove(gameCode: string, move: GameMove, newFEN: string): Promise<boolean> {
    const gamesRef = ref(this.db, 'games');
    const snapshot = await get(gamesRef);
    const games = snapshot.val() || {};

    const gameEntry = Object.entries(games).find(([_, game]: [string, any]) => {
      const gameData = game as OnlineGame;
      return gameData.gameCode === gameCode;
    });

    if (!gameEntry) {
      return false;
    }

    const [gameId, game] = gameEntry;
    const gameData = game as OnlineGame;
    if (gameData.status !== 'playing' || gameData.currentPlayer !== move.color) {
      return false;
    }

    const updates: any = {
      [`games/${gameId}/board`]: newFEN, // Use the new FEN string
      [`games/${gameId}/currentPlayer`]: move.color === 'white' ? 'black' : 'white',
      [`games/${gameId}/lastMoveAt`]: Date.now()
    };

    await update(ref(this.db), updates);
    return true;
  }

  // Get current game state
  getCurrentGameState(): Observable<GameState | null> {
    return this.currentGameState.asObservable();
  }

  // Clean up when leaving the game
  cleanup() {
    if (this.gameRef) {
      // Unsubscribe from any listeners
      this.gameRef = null;
    }
    this.currentGameState.next(null);
  }
} 