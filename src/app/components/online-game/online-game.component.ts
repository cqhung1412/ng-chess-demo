import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../../material.module';
import { OnlineGameService } from '../../services/online-game.service';
import { GameState, GameMove, PlayerColor } from '../../models/online-game.model';
import { Subscription } from 'rxjs';
import { NgxChessBoardView, NgxChessBoardModule } from 'ngx-chess-board';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { getDatabase, ref as dbRef, get as dbGet } from '@angular/fire/database';

@Component({
  selector: 'app-online-game',
  standalone: true,
  imports: [
    RouterLink,
    MaterialModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    NgxChessBoardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './online-game.component.html',
  styleUrls: ['./online-game.component.scss']
})
export class OnlineGameComponent implements OnInit, OnDestroy {
  @ViewChild('board') board!: NgxChessBoardView;
  private gameSubscription: Subscription | null = null;
  currentGameState: GameState | null = null;
  isWhitePlayer: boolean = false;
  gameCode: string | null = null;
  private routeSubscription: Subscription | null = null;
  title = 'Online Chess Game';
  isCreatingGame = false;

  constructor(
    private route: ActivatedRoute,
    private onlineGameService: OnlineGameService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.gameCode = params['gameCode'] || null;
    });
  }

  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    this.onlineGameService.cleanup();
  }

  async createNewGame(playerName: string) {
    console.log('Creating new game with player name:', playerName);
    if (!playerName) {
      console.log('Player name is empty');
      return;
    }
    this.isCreatingGame = true;
    try {
      this.gameCode = await this.onlineGameService.createGame(playerName);
      console.log('Game created with code:', this.gameCode);
      this.isWhitePlayer = true;

      // Directly read the games from Firebase after creation
      const db = getDatabase();
      const gamesRef = dbRef(db, 'games');
      const snapshot = await dbGet(gamesRef);
      const games = snapshot.val() || {};
      console.log('Direct read after creation, available games:', Object.values(games).map((g: any) => g.gameCode));

      setTimeout(() => {
        this.listenToGame();
        this.isCreatingGame = false;
        this.cdr.detectChanges();
      }, 1000); // 1 second delay
    } catch (error) {
      console.error('Error creating game:', error);
      this.isCreatingGame = false;
    }
  }

  async joinGame(gameCode: string, playerName: string) {
    console.log('Joining game:', gameCode, 'with player name:', playerName);
    if (!gameCode || !playerName) {
      console.log('Game code or player name is empty');
      return;
    }
    try {
      const success = await this.onlineGameService.joinGame(gameCode, playerName);
      if (success) {
        console.log('Successfully joined game');
        this.gameCode = gameCode;
        this.isWhitePlayer = false;
        this.listenToGame();
      } else {
        console.log('Failed to join game');
      }
    } catch (error) {
      console.error('Error joining game:', error);
    }
  }

  private listenToGame() {
    if (!this.gameCode) {
      console.log('No game code available to listen to');
      return;
    }
    
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }

    console.log('Starting to listen to game:', this.gameCode);
    this.gameSubscription = this.onlineGameService.listenToGame(this.gameCode)
      .subscribe({
        next: (gameState: GameState | null) => {
          console.log('Received game state:', gameState);
          this.currentGameState = gameState;
          if (gameState && this.board) {
            this.board.setFEN(gameState.game.board);
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error listening to game:', error);
        }
      });
  }

  onMove(move: any) {
    if (!this.currentGameState || !this.gameCode) {
      console.log('Cannot make move: no game state or game code');
      return;
    }

    const myColor = this.isWhitePlayer ? 'white' : 'black';
    if (this.currentGameState.game.currentPlayer !== myColor) {
      console.log('Not your turn!');
      return;
    }

    // Only allow moving your own pieces
    if ((myColor === 'white' && move.color !== 'white') ||
        (myColor === 'black' && move.color !== 'black')) {
      console.log('Cannot move opponent\'s pieces!');
      return;
    }

    const newFEN = this.board.getFEN();
    console.log('Making move:', move, 'New FEN:', newFEN);

    const gameMove: GameMove = {
      from: move.from,
      to: move.to,
      piece: move.piece,
      color: myColor,
      timestamp: Date.now()
    };

    this.onlineGameService.makeMove(this.gameCode, gameMove, newFEN);
  }

  get waitingForOpponent(): boolean {
    return !!this.currentGameState && !this.currentGameState.players.black;
  }

  get waitingForOpponentMove(): boolean {
    if (!this.currentGameState) return false;
    const myColor = this.isWhitePlayer ? 'white' : 'black';
    return this.currentGameState.game.currentPlayer !== myColor;
  }
}
