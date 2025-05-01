/**
 * @fileoverview Service for managing online multiplayer chess games using Firebase Realtime Database.
 * Handles game creation, joining, move synchronization, and state management.
 */

import { Injectable } from '@angular/core';
import { Database, ref, set, get, onValue, push, update, remove, DataSnapshot } from '@angular/fire/database';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { OnlineGame, GameState, GameMove, GamePlayer, GameStatus, PlayerColor } from '../models/online-game.model';

/**
 * @description
 * Service that manages online multiplayer chess games.
 * 
 * This service:
 * - Creates and manages game instances
 * - Handles player joining and game state synchronization
 * - Manages move validation and turn switching
 * - Provides real-time game state updates
 * 
 * @Injectable decorator configures the service as a root-level injectable.
 */
@Injectable({
  providedIn: 'root'
})
export class OnlineGameService {
  /** @description BehaviorSubject for managing the current game state */
  private currentGameState = new BehaviorSubject<GameState | null>(null);
  
  /** @description Reference to the current game in Firebase */
  private gameRef: any = null;

  constructor(private db: Database) {}

  /**
   * @description
   * Generates a random 6-character game code.
   * @returns {string} A randomly generated game code
   */
  private generateGameCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * @description
   * Creates a new online chess game.
   * @param {string} playerName - The name of the player creating the game
   * @returns {Promise<string>} A promise that resolves to the game code
   */
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

  /**
   * @description
   * Joins an existing game with the specified game code.
   * @param {string} gameCode - The code of the game to join
   * @param {string} playerName - The name of the player joining the game
   * @returns {Promise<boolean>} A promise that resolves to true if join was successful
   */
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

  /**
   * @description
   * Sets up a listener for game state changes.
   * @param {string} gameCode - The code of the game to listen to
   * @returns {Observable<GameState | null>} An observable of game state updates
   */
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

  /**
   * @description
   * Makes a move in the specified game.
   * @param {string} gameCode - The code of the game
   * @param {GameMove} move - The move to make
   * @param {string} newFEN - The new FEN string representing the board state
   * @returns {Promise<boolean>} A promise that resolves to true if the move was successful
   */
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

  /**
   * @description
   * Gets the current game state as an observable.
   * @returns {Observable<GameState | null>} An observable of the current game state
   */
  getCurrentGameState(): Observable<GameState | null> {
    return this.currentGameState.asObservable();
  }

  /**
   * @description
   * Cleans up resources when leaving the game.
   */
  cleanup() {
    if (this.gameRef) {
      // Unsubscribe from any listeners
      this.gameRef = null;
    }
    this.currentGameState.next(null);
  }
} 