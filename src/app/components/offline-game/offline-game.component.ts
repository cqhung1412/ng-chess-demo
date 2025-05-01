import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, NgZone, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChessMessageService } from '../../services/chess-message.service';
import { GameStateService } from '../../services/game-state.service';
import { ContinueGameDialogComponent } from '../continue-game-dialog/continue-game-dialog.component';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-offline-game',
  standalone: true,
  imports: [CommonModule, RouterLink, ContinueGameDialogComponent, MaterialModule],
  templateUrl: './offline-game.component.html',
  styleUrls: ['./offline-game.component.scss']
})
export class OfflineGameComponent implements AfterViewInit, OnInit, OnDestroy {
  title = 'Offline Chess Game';
  isWhiteTurn = true;
  moveCount = 0;
  private lastProcessedMove: string | null = null;
  gameEnded = false;
  gameEndMessage = '';
  private moveHistory: string[] = [];
  showContinueDialog = false;

  @ViewChildren('iframeBox') iframes!: QueryList<ElementRef<HTMLIFrameElement>>;

  constructor(
    private ngZone: NgZone,
    private gameStateService: GameStateService
  ) {}

  ngOnInit() {
    const savedState = this.gameStateService.loadGameState();
    if (savedState) {
      this.showContinueDialog = true;
      window.addEventListener('continueGameChoice', this.handleContinueChoice);
    }
  }

  ngOnDestroy() {
    window.removeEventListener('continueGameChoice', this.handleContinueChoice);
  }

  private handleContinueChoice = (event: Event) => {
    const customEvent = event as CustomEvent;
    this.ngZone.run(() => {
      this.showContinueDialog = false;
      if (customEvent.detail) {
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
  };

  private resetGameState() {
    this.moveCount = 0;
    this.isWhiteTurn = true;
    this.lastProcessedMove = null;
    this.moveHistory = [];
    this.gameStateService.clearGameState();
  }

  private reloadIframes() {
    const iframeArray = this.iframes.toArray();
    iframeArray.forEach(iframe => {
      iframe.nativeElement.contentWindow?.location.reload();
    });
  }

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

  private saveGameState() {
    const gameState = {
      moveCount: this.moveCount,
      isWhiteTurn: this.isWhiteTurn,
      lastProcessedMove: this.lastProcessedMove,
      moveHistory: this.moveHistory
    };
    this.gameStateService.saveGameState(gameState);
  }

  resetGame() {
    this.gameEnded = false;
    this.gameEndMessage = '';
    this.resetGameState();
    this.reloadIframes();
  }
}
