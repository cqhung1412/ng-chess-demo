/**
 * @fileoverview Offline chess game component of the Angular Chess Demo.
 * Handles local two-player chess gameplay with state persistence.
 */

import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, NgZone, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChessMessageService } from '../../services/chess-message.service';
import { GameStateService } from '../../services/game-state.service';
import { MaterialModule } from '../../material.module';

/**
 * @description
 * The offline game component that manages local two-player chess gameplay.
 * 
 * This component:
 * - Implements game state management
 * - Handles move synchronization between players
 * - Provides game persistence functionality
 * - Manages game end conditions
 * 
 * @Component decorator configures the component with:
 * - selector: 'app-offline-game' for component identification
 * - standalone: true for standalone component configuration
 * - imports: Required modules and components
 * - templateUrl: Reference to the HTML template
 * - styleUrls: Reference to the SCSS styles
 */
@Component({
  selector: 'app-offline-game',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './offline-game.component.html',
  styleUrls: ['./offline-game.component.scss']
})
export class OfflineGameComponent implements AfterViewInit, OnInit, OnDestroy {
  /** @description The title of the offline game page */
  title = 'Offline Chess Game';
  
  /** @description Indicates if it's white's turn to move */
  isWhiteTurn = true;
  
  /** @description Count of moves made in the current game */
  moveCount = 0;
  
  /** @description The last processed move to prevent duplicate processing */
  private lastProcessedMove: string | null = null;
  
  /** @description Flag indicating if the game has ended */
  gameEnded = false;
  
  /** @description Message to display when the game ends */
  gameEndMessage = '';
  
  /** @description History of moves made in the current game */
  private moveHistory: string[] = [];
  
  /** @description Flag to control the display of the continue game dialog */
  showContinueDialog = false;

  /** @description Query for accessing the iframe elements in the template */
  @ViewChildren('iframeBox') iframes!: QueryList<ElementRef<HTMLIFrameElement>>;

  constructor(
    private ngZone: NgZone,
    private gameStateService: GameStateService
  ) {}

  /**
   * @description
   * Initializes the component and checks for saved game state.
   * Shows the continue game dialog if a saved game exists.
   */
  ngOnInit() {
    const savedState = this.gameStateService.loadGameState();
    if (savedState) {
      this.showContinueDialog = true;
    }
  }

  /**
   * @description
   * Cleans up event listeners when the component is destroyed.
   */
  ngOnDestroy() {
    // No need to remove event listeners as we're not using them anymore
  }

  /**
   * @description
   * Handles the user's choice to continue or start a new game.
   * @param {boolean} continueGame - Whether to continue the existing game
   */
  private handleContinueChoice(continueGame: boolean): void {
    this.ngZone.run(() => {
      this.showContinueDialog = false;
      if (continueGame) {
        // User wants to continue the game
        const savedState = this.gameStateService.loadGameState();
        if (savedState) {
          this.moveCount = savedState.moveCount;
          this.isWhiteTurn = savedState.isWhiteTurn;
          this.lastProcessedMove = savedState.lastProcessedMove;
          this.moveHistory = savedState.moveHistory;
        }
      } else {
        // User wants to start a new game
        this.resetGameState();
        this.reloadIframes();
      }
    });
  }

  /**
   * @description
   * Handles the "No" button click in the continue game dialog.
   */
  onNoClick(): void {
    this.handleContinueChoice(false);
  }

  /**
   * @description
   * Handles the "Yes" button click in the continue game dialog.
   */
  onYesClick(): void {
    this.handleContinueChoice(true);
  }

  /**
   * @description
   * Resets the game state to its initial values.
   */
  private resetGameState() {
    this.moveCount = 0;
    this.isWhiteTurn = true;
    this.lastProcessedMove = null;
    this.moveHistory = [];
    this.gameStateService.clearGameState();
  }

  /**
   * @description
   * Reloads all iframe elements to reset the chess board.
   */
  private reloadIframes() {
    const iframeArray = this.iframes.toArray();
    iframeArray.forEach(iframe => {
      iframe.nativeElement.contentWindow?.location.reload();
    });
  }

  /**
   * @description
   * Sets up message event listeners after the view is initialized.
   * Handles move synchronization and game end conditions.
   */
  ngAfterViewInit() {
    window.addEventListener('message', (event) => {
      if (ChessMessageService.isChessMoveMessage(event)) {
        this.ngZone.run(() => {
          // Prevent processing the same move twice
          if (this.lastProcessedMove === event.data.move) {
            return;
          }
          this.lastProcessedMove = event.data.move;
          this.moveHistory.push(event.data.move);

          const iframeArray = this.iframes.toArray();
          const sourceIndex = iframeArray.findIndex(
            iframe => iframe.nativeElement.contentWindow === event.source
          );
          if (sourceIndex === -1) return;
          const targetIndex = sourceIndex === 0 ? 1 : 0;
          const targetIframe = iframeArray[targetIndex];
          if (targetIframe) {
            ChessMessageService.sendMove(
              targetIframe.nativeElement.contentWindow!,
              event.data.move
            );
            // Update turn based on move count
            this.moveCount++;
            this.isWhiteTurn = this.moveCount % 2 === 0;
            
            // Save game state after each move
            this.saveGameState();
          }
        });
      } else if (ChessMessageService.isChessGameEndMessage(event)) {
        this.ngZone.run(() => {
          this.gameEnded = true;
          this.gameEndMessage = event.data.message;
          // Clear game state when game ends
          this.gameStateService.clearGameState();
        });
      }
    });
  }

  /**
   * @description
   * Saves the current game state to persistent storage.
   */
  private saveGameState() {
    const gameState = {
      moveCount: this.moveCount,
      isWhiteTurn: this.isWhiteTurn,
      lastProcessedMove: this.lastProcessedMove,
      moveHistory: this.moveHistory
    };
    this.gameStateService.saveGameState(gameState);
  }

  /**
   * @description
   * Resets the game to its initial state.
   */
  resetGame() {
    this.gameEnded = false;
    this.gameEndMessage = '';
    this.resetGameState();
    this.reloadIframes();
  }
}
