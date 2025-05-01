import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-continue-game-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" (click)="onNoClick()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <h2>Continue Previous Game?</h2>
        <p>We found a game in progress. Would you like to continue where you left off?</p>
        <div class="dialog-actions">
          <button (click)="onNoClick()">Start New Game</button>
          <button (click)="onYesClick()" class="primary">Continue Game</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 90%;
    }

    h2 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    p {
      margin: 0 0 1.5rem 0;
      color: #666;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s ease;
    }

    button.primary {
      background-color: #4a90e2;
      color: white;
    }

    button.primary:hover {
      background-color: #357abd;
    }

    button:not(.primary) {
      background-color: #f5f5f5;
      color: #333;
    }

    button:not(.primary):hover {
      background-color: #e0e0e0;
    }
  `]
})
export class ContinueGameDialogComponent {
  constructor() {}

  onNoClick(): void {
    window.dispatchEvent(new CustomEvent('continueGameChoice', { detail: false }));
  }

  onYesClick(): void {
    window.dispatchEvent(new CustomEvent('continueGameChoice', { detail: true }));
  }
} 