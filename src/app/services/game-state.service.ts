import { Injectable } from '@angular/core';

export interface GameState {
  moveCount: number;
  isWhiteTurn: boolean;
  lastProcessedMove: string | null;
  moveHistory: string[];
}

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly STORAGE_KEY = 'chess_game_state';

  saveGameState(state: GameState): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  loadGameState(): GameState | null {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  }

  clearGameState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
} 