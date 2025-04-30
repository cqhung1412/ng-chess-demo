/**
 * IframePageComponent
 *
 * This component is used as the content for the /iframepage route. It renders a simple chess board using ngx-chess-board.
 * Intended to be loaded inside iframes for the offline game page.
 */
import { Component, ViewChild, NgZone, AfterViewInit, OnInit } from '@angular/core';
import { NgxChessBoardModule, NgxChessBoardView } from 'ngx-chess-board';
import { ChessMessageService } from '../../services/chess-message.service';

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

  constructor(private ngZone: NgZone) {
    // Check for ?rotated=true in the URL
    const params = new URLSearchParams(window.location.search);
    this.shouldRotate = params.get('rotated') === 'true';
  }

  ngOnInit() {
    window.addEventListener('message', (event) => {
      if (ChessMessageService.isChessMoveMessage(event)) {
        this.ngZone.run(() => {
          this.board.move(event.data.move);
        });
      }
    });
  }

  ngAfterViewInit() {
    if (this.shouldRotate) {
      setTimeout(() => this.board.reverse(), 0);
    }
  }

  onMove(event: any) {
    ChessMessageService.sendMove(window.parent, event.move);
    
    // Log move history for debugging
    const history = this.board.getMoveHistory();
    // console.log('Move history:', history);

    // Check for checkmate using the last move
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