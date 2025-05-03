/**
 * IframePageComponent
 *
 * This component is used as the content for the /iframepage route. It renders a simple chess board using ngx-chess-board.
 * Intended to be loaded inside iframes for the offline game page.
 */
import { Component, ViewChild, NgZone, AfterViewInit, OnInit, HostListener } from '@angular/core';
import { NgxChessBoardModule, NgxChessBoardView } from 'ngx-chess-board';
import { ChessMessageService } from '../../services/chess-message.service';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-iframepage',
  standalone: true,
  imports: [NgxChessBoardModule],
  templateUrl: './iframepage.component.html',
  styleUrls: ['./iframepage.component.scss']
})
export class IframePageComponent implements AfterViewInit, OnInit {
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;
  private shouldRotate = false;
  private isMobile = false;
  boardSize = 400;
  private moveCount = 0;
  private orientation: 'white' | 'black' = 'black';

  constructor(
    private ngZone: NgZone,
    private gameStateService: GameStateService
  ) {
    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    this.shouldRotate = params.get('rotated') === 'true';
    this.isMobile = params.get('mobile') === 'true';
    this.calculateBoardSize();
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isMobile) {
      this.calculateBoardSize();
    }
  }

  private calculateBoardSize() {
    if (this.isMobile) {
      // Subtract toolbar height (64px) and padding (32px)
      const width = window.innerWidth - 32;
      const height = window.innerHeight - 64 - 32;
      this.boardSize = Math.max(100, Math.min(width, height));
    }
  }

  private updateBoardOrientation() {
    if (!this.isMobile) return;
    const shouldBe: 'white' | 'black' = (this.moveCount % 2 === 0) ? 'white' : 'black';
    if (this.orientation !== shouldBe) {
      this.board.reverse();
      this.orientation = shouldBe;
    }
  }

  ngOnInit() {
    window.addEventListener('message', (event) => {
      if (ChessMessageService.isChessMoveMessage(event)) {
        this.ngZone.run(() => {
          this.board.move(event.data.move);
          if (this.isMobile) {
            this.moveCount++;
            this.updateBoardOrientation();
          }
        });
      }
    });
  }

  ngAfterViewInit() {
    if (this.shouldRotate) {
      setTimeout(() => {
        this.board.reverse();
        this.orientation = 'black';
      }, 0);
    }

    // Load and apply saved game state
    const savedState = this.gameStateService.loadGameState();
    if (savedState && savedState.moveHistory.length > 0) {
      savedState.moveHistory.forEach(move => {
        this.board.move(move);
      });
      if (this.isMobile) {
        this.moveCount = savedState.moveHistory.length;
        // Set orientation based on move count
        this.orientation = (this.moveCount % 2 === 0) ? 'white' : 'black';
        // Always start with white, so reverse if black
        if (this.orientation === 'black') {
          setTimeout(() => this.board.reverse(), 0);
        }
      }
    } else if (this.isMobile) {
      this.moveCount = 0;
      this.orientation = 'white';
    }
  }

  onMove(event: any) {
    ChessMessageService.sendMove(window.parent, event.move);
    if (this.isMobile) {
      this.moveCount++;
      this.updateBoardOrientation();
    }
    // Check for checkmate using the last move
    const history = this.board.getMoveHistory();
    const lastMove = history[history.length - 1];
    if (lastMove && lastMove.mate) {
      const winner = lastMove.color === 'white' ? 'White' : 'Black';
      window.parent.postMessage({
        type: 'gameEnd',
        winner,
        message: `Checkmate! ${winner} wins!`
      }, window.origin);
    }
  }
} 