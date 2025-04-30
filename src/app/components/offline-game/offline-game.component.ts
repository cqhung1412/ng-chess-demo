import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, NgZone } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChessMessageService } from '../../services/chess-message.service';

@Component({
  selector: 'app-offline-game',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './offline-game.component.html',
  styleUrls: ['./offline-game.component.scss']
})
export class OfflineGameComponent implements AfterViewInit {
  title = 'Offline Chess Game';
  isWhiteTurn = true;
  moveCount = 0;
  private lastProcessedMove: string | null = null;

  @ViewChildren('iframeBox') iframes!: QueryList<ElementRef<HTMLIFrameElement>>;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    window.addEventListener('message', (event) => {
      if (ChessMessageService.isChessMoveMessage(event)) {
        this.ngZone.run(() => {
          // Prevent processing the same move twice
          if (this.lastProcessedMove === event.data.move) {
            return;
          }
          this.lastProcessedMove = event.data.move;

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
          }
        });
      }
    });
  }
}
