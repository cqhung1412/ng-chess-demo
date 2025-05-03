/**
 * @fileoverview Service for handling chess-related message communication between iframes.
 * Provides utilities for message validation and sending.
 */

import { Injectable } from '@angular/core';
import { ChessMoveMessage, ChessGameEndMessage } from '../models/chess-message.model';

/**
 * @description
 * Service that manages chess-related message communication between iframes.
 * 
 * This service:
 * - Validates chess move messages
 * - Validates game end messages
 * - Provides methods for sending moves between iframes
 * 
 * @Injectable decorator configures the service as a root-level injectable.
 */
@Injectable({ providedIn: 'root' })
export class ChessMessageService {
  /** @description The origin of the current window for message validation */
  static readonly ORIGIN = window.origin;

  /**
   * @description
   * Checks if a message event is a valid chess move message.
   * @param {MessageEvent} event - The message event to check
   * @returns {boolean} True if the event is a valid chess move message
   */
  static isChessMoveMessage(event: MessageEvent): event is MessageEvent<ChessMoveMessage> {
    return event.origin === ChessMessageService.ORIGIN &&
      event.data &&
      event.data.type === 'move' &&
      typeof event.data.move === 'string';
  }

  /**
   * @description
   * Checks if a message event is a valid game end message.
   * @param {MessageEvent} event - The message event to check
   * @returns {boolean} True if the event is a valid game end message
   */
  static isChessGameEndMessage(event: MessageEvent): event is MessageEvent<ChessGameEndMessage> {
    return event.origin === ChessMessageService.ORIGIN &&
      event.data &&
      event.data.type === 'gameEnd' &&
      typeof event.data.winner === 'string' &&
      typeof event.data.message === 'string';
  }

  /**
   * @description
   * Sends a chess move to a target window.
   * @param {Window} target - The target window to send the move to
   * @param {string} move - The move to send
   */
  static sendMove(target: Window, move: string) {
    target.postMessage({ type: 'move', move }, ChessMessageService.ORIGIN);
  }
} 