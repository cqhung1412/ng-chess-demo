import { Injectable } from '@angular/core';
import { ChessMoveMessage, ChessGameEndMessage } from '../models/chess-message.model';

@Injectable({ providedIn: 'root' })
export class ChessMessageService {
  static readonly ORIGIN = window.origin;

  static isChessMoveMessage(event: MessageEvent): event is MessageEvent<ChessMoveMessage> {
    return event.origin === ChessMessageService.ORIGIN &&
      event.data &&
      event.data.type === 'move' &&
      typeof event.data.move === 'string';
  }

  static isChessGameEndMessage(event: MessageEvent): event is MessageEvent<ChessGameEndMessage> {
    return event.origin === ChessMessageService.ORIGIN &&
      event.data &&
      event.data.type === 'gameEnd' &&
      typeof event.data.winner === 'string' &&
      typeof event.data.message === 'string';
  }

  static sendMove(target: Window, move: string) {
    target.postMessage({ type: 'move', move }, ChessMessageService.ORIGIN);
  }
} 