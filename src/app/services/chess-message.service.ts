import { Injectable } from '@angular/core';
import { ChessMoveMessage } from '../models/chess-message.model';

@Injectable({ providedIn: 'root' })
export class ChessMessageService {
  static readonly ORIGIN = window.origin;

  static isChessMoveMessage(event: MessageEvent): event is MessageEvent<ChessMoveMessage> {
    return event.origin === ChessMessageService.ORIGIN &&
      event.data &&
      event.data.type === 'move' &&
      typeof event.data.move === 'string';
  }

  static sendMove(target: Window, move: string) {
    target.postMessage({ type: 'move', move }, ChessMessageService.ORIGIN);
  }
} 