/**
 * @fileoverview Online chess game component of the Angular Chess Demo.
 * Handles real-time multiplayer chess gameplay using Firebase.
 */

import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { getDatabase, ref as dbRef, get as dbGet } from '@angular/fire/database';

/**
 * @description
 * The online game component that manages real-time multiplayer chess gameplay.
 * 
 * This component:
 * - Handles game creation and joining
 * - Manages real-time game state synchronization
 * - Implements move validation and turn management
 * - Provides player interaction with the chess board
 * - Allows copying the game code to clipboard while waiting for a second player
 * 
 * @Component decorator configures the component with:
 * - selector: 'app-online-game' for component identification
 * - standalone: true for standalone component configuration
 * - imports: Required modules and components
 * - templateUrl: Reference to the HTML template
 * - styleUrls: Reference to the SCSS styles
 */
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
export class OnlineGameComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  /** @description Reference to the chess board component */
  @ViewChild('board') board!: NgxChessBoardView;
  
  /** @description Subscription to game state updates */
  private gameSubscription: Subscription | null = null;
  
  /** @description Current state of the game */
  currentGameState: GameState | null = null;
  
  /** @description Indicates if the current player is playing as white */
  isWhitePlayer: boolean = false;
  
  /** @description Unique code identifying the current game */
  gameCode: string | null = null;
  
  /** @description Subscription to route parameter changes */
  private routeSubscription: Subscription | null = null;
  
  /** @description Title of the online game page */
  title = 'Online Chess Game';
  
  /** @description Flag indicating if a new game is being created */
  isCreatingGame = false;

  /**
   * @description Animated dots for waiting message
   */
  animatedDots: string = '.';
  private dotsInterval: any = null;

  /** @description Flag indicating if the game has ended */
  gameEnded = false;

  /** @description Message to display when the game ends */
  gameEndMessage = '';

  /** @description Flag indicating if a rematch has been requested */
  rematchRequested = false;

  /** @description Flag indicating if the opponent has requested a rematch */
  opponentRematchRequested = false;

  /** @description Flag indicating if waiting for opponent to accept rematch */
  waitingForRematchAcceptance = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private onlineGameService: OnlineGameService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  /**
   * @description
   * Initializes the component and subscribes to route parameters.
   */
  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.gameCode = params['gameCode'] || null;
    });
    // Watch for waitingForOpponentMove changes
    this.setupDotsAnimation();
  }

  /**
   * @description
   * Cleans up subscriptions and resources when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    this.onlineGameService.cleanup();
    this.clearDotsAnimation();
  }

  ngAfterViewInit(): void {
    // No-op
  }

  ngAfterViewChecked(): void {
    // No-op
  }

  /**
   * @description
   * Creates a new online game with the specified player name.
   * @param {string} playerName - The name of the player creating the game
   */
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

  /**
   * @description
   * Joins an existing game with the specified game code and player name.
   * @param {string} gameCode - The unique code of the game to join
   * @param {string} playerName - The name of the player joining the game
   */
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

  /**
   * @description
   * Sets up a subscription to listen for game state updates.
   */
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
          const previousState = this.currentGameState;
          this.currentGameState = gameState;
          
          if (gameState && this.board) {
            // Only reset the board when transitioning from rematch_requested to playing
            const wasRematchRequested = previousState?.game.status === 'rematch_requested';
            const isNowPlaying = gameState.game.status === 'playing';
            
            if (wasRematchRequested && isNowPlaying) {
              this.board.reset();
              if (!this.isWhitePlayer) {
                setTimeout(() => {
                  this.board.reverse();
                });
              }
            } else {
              this.board.setFEN(gameState.game.board);
              if (!this.isWhitePlayer) {
                setTimeout(() => {
                  this.board.reverse();
                });
              }
            }
          }

          // Update rematch states
          if (gameState) {
            // Reset rematch states when game status changes to playing
            if (gameState.game.status === 'playing') {
              this.rematchRequested = false;
              this.opponentRematchRequested = false;
              this.waitingForRematchAcceptance = false;
            }
            
            // Update rematch states based on game status
            if (gameState.game.status === 'rematch_requested') {
              // If I requested the rematch
              if (this.rematchRequested) {
                this.waitingForRematchAcceptance = true;
                this.opponentRematchRequested = false;
              } else {
                // If opponent requested the rematch
                this.opponentRematchRequested = true;
                this.waitingForRematchAcceptance = false;
              }
            }
            
            // Game is considered ended if it's completed OR if a rematch is requested
            this.gameEnded = gameState.game.status === 'completed' || gameState.game.status === 'rematch_requested';
            
            if (this.gameEnded) {
              if (gameState.game.status === 'completed') {
                const winner = gameState.game.winner === 'white' ? 'White' : 'Black';
                this.gameEndMessage = `Checkmate! ${winner} wins!`;
              } else if (gameState.game.status === 'rematch_requested') {
                if (this.rematchRequested) {
                  this.gameEndMessage = 'Game Over - Waiting for opponent to accept rematch';
                } else {
                  this.gameEndMessage = 'Game Over - Opponent requested a rematch';
                }
              }
            }
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error listening to game:', error);
        }
      });
  }

  /**
   * @description
   * Handles a move made by the player on the chess board.
   * @param {any} move - The move object containing move details
   */
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
    const moveHistory = this.board.getMoveHistory();
    const lastMove = moveHistory[moveHistory.length - 1];

    // Log game state
    console.log('Game State:', {
      moves: moveHistory,
      lastMove: {
        ...lastMove,
        check: move.check,
        mate: move.mate
      }
    });

    const gameMove: GameMove = {
      from: move.from,
      to: move.to,
      piece: move.piece,
      color: myColor,
      timestamp: Date.now()
    };

    // Only update the backend if not checkmate; checkmate will be handled by backend/game state
    if (move.mate) {
      this.onlineGameService.endGame(this.gameCode, move.color);
    } else {
      this.onlineGameService.makeMove(this.gameCode, gameMove, newFEN);
    }
  }

  /**
   * @description
   * Checks if the game is waiting for an opponent to join.
   * @returns {boolean} True if waiting for an opponent, false otherwise
   */
  get waitingForOpponent(): boolean {
    return !!this.currentGameState && !this.currentGameState.players.black;
  }

  /**
   * @description
   * Checks if the game is waiting for the opponent's move.
   * @returns {boolean} True if waiting for opponent's move, false otherwise
   */
  get waitingForOpponentMove(): boolean {
    if (!this.currentGameState) return false;
    const myColor = this.isWhitePlayer ? 'white' : 'black';
    return this.currentGameState.game.currentPlayer !== myColor;
  }

  /**
   * @description
   * Copies the game code to the clipboard and shows a confirmation snackbar.
   */
  copyGameCodeToClipboard(): void {
    if (this.gameCode) {
      navigator.clipboard.writeText(this.gameCode).then(() => {
        this.snackBar.open('Game code copied to clipboard!', 'Close', { duration: 2000 });
      });
    }
  }

  /**
   * @description Sets up the animated dots interval if needed
   */
  private setupDotsAnimation(): void {
    // Use a MutationObserver or polling to check for waitingForOpponentMove changes
    setInterval(() => {
      if (this.waitingForOpponentMove && !this.waitingForOpponent) {
        if (!this.dotsInterval) {
          this.dotsInterval = setInterval(() => {
            if (this.animatedDots.length >= 3) {
              this.animatedDots = '.';
            } else {
              this.animatedDots += '.';
            }
          }, 500);
        }
      } else {
        this.clearDotsAnimation();
      }
    }, 200);
  }

  /**
   * @description Clears the animated dots interval
   */
  private clearDotsAnimation(): void {
    if (this.dotsInterval) {
      clearInterval(this.dotsInterval);
      this.dotsInterval = null;
      this.animatedDots = '.';
    }
  }

  /**
   * @description
   * Resets the game state and creates a new game.
   */
  resetGame(): void {
    this.gameEnded = false;
    this.gameEndMessage = '';
    this.rematchRequested = false;
    this.opponentRematchRequested = false;
    this.router.navigate(['/online']);
  }

  /**
   * @description
   * Requests a rematch from the opponent.
   */
  requestRematch(): void {
    if (!this.gameCode || this.rematchRequested) return;
    this.rematchRequested = true;
    this.onlineGameService.requestRematch(this.gameCode);
  }

  /**
   * @description
   * Accepts a rematch request from the opponent.
   */
  acceptRematch(): void {
    if (!this.gameCode || !this.opponentRematchRequested) return;
    this.onlineGameService.acceptRematch(this.gameCode);
  }
}
