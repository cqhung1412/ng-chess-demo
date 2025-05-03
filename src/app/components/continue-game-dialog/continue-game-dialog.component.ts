import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-continue-game-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './continue-game-dialog.component.html',
  styleUrls: ['./continue-game-dialog.component.scss']
})
export class ContinueGameDialogComponent {
  constructor() { }

  onNoClick(): void {
    window.dispatchEvent(new CustomEvent('continueGameChoice', { detail: false }));
  }

  onYesClick(): void {
    window.dispatchEvent(new CustomEvent('continueGameChoice', { detail: true }));
  }
} 