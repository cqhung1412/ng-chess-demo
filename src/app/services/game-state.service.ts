/**
 * @fileoverview Service for managing local game state persistence.
 * Handles saving and loading game state to/from localStorage.
 */

import { Injectable } from '@angular/core';

/**
 * @description
 * Interface representing the state of a chess game.
 * 
 * @interface GameState
 * @property {number} moveCount - The number of moves made in the game
 * @property {boolean} isWhiteTurn - Indicates if it's white's turn to move
 * @property {string | null} lastProcessedMove - The last move that was processed
 * @property {string[]} moveHistory - Array of all moves made in the game
 */
export interface GameState {
  moveCount: number;
  isWhiteTurn: boolean;
  lastProcessedMove: string | null;
  moveHistory: string[];
}

/**
 * @description
 * Service that manages the persistence of local game state.
 * 
 * This service:
 * - Saves game state to localStorage
 * - Loads game state from localStorage
 * - Clears saved game state
 * 
 * @Injectable decorator configures the service as a root-level injectable.
 */
@Injectable({ providedIn: 'root' })
export class GameStateService {
  /** @description Key used to store game state in localStorage */
  private readonly STORAGE_KEY = 'chess_game_state';

  /**
   * @description
   * Saves the current game state to localStorage.
   * @param {GameState} state - The game state to save
   */
  saveGameState(state: GameState): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  /**
   * @description
   * Loads the saved game state from localStorage.
   * @returns {GameState | null} The saved game state, or null if none exists
   */
  loadGameState(): GameState | null {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  }

  /**
   * @description
   * Clears the saved game state from localStorage.
   */
  clearGameState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
} 