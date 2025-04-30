import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef, NgZone } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-offline-game',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './offline-game.component.html',
  styleUrls: ['./offline-game.component.scss']
})
export class OfflineGameComponent implements AfterViewInit {
  title = 'Offline Chess Game';

  @ViewChildren('iframeBox') iframes!: QueryList<ElementRef<HTMLIFrameElement>>;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    window.addEventListener('message', (event) => {
      // Only accept messages from the same origin
      if (event.origin !== window.origin) return;
      if (event.data && event.data.type === 'move' && event.data.move) {
        this.ngZone.run(() => {
          // Determine which iframe sent the message
          const iframeArray = this.iframes.toArray();
          const sourceIndex = iframeArray.findIndex(
            iframe => iframe.nativeElement.contentWindow === event.source
          );
          if (sourceIndex === -1) return;
          // Send the move to the other iframe
          const targetIndex = sourceIndex === 0 ? 1 : 0;
          const targetIframe = iframeArray[targetIndex];
          if (targetIframe) {
            targetIframe.nativeElement.contentWindow?.postMessage(
              { type: 'move', move: event.data.move },
              window.origin
            );
          }
        });
      }
    });
  }
}
