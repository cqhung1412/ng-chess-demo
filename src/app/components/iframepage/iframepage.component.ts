/**
 * IframePageComponent
 *
 * This component is used as the content for the /iframepage route. It renders a simple chess board using ngx-chess-board.
 * Intended to be loaded inside iframes for the offline game page.
 */
import { Component, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { NgxChessBoardModule, NgxChessBoardView } from 'ngx-chess-board';

@Component({
  selector: 'app-iframepage',
  standalone: true,
  imports: [NgxChessBoardModule],
  templateUrl: './iframepage.component.html',
  styleUrls: ['./iframepage.component.scss']
})
export class IframePageComponent implements AfterViewInit {
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;
  private shouldRotate = false;

  constructor(private ngZone: NgZone) {
    // Check for ?rotated=true in the URL
    const params = new URLSearchParams(window.location.search);
    this.shouldRotate = params.get('rotated') === 'true';
  }

  ngOnInit() {
    window.addEventListener('message', (event) => {
      // Only accept messages from the same origin
      if (event.origin !== window.origin) return;
      if (event.data && event.data.type === 'move' && event.data.move) {
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
    // event.move is like 'e2e4'
    window.parent.postMessage({ type: 'move', move: event.move }, window.origin);
  }
} 