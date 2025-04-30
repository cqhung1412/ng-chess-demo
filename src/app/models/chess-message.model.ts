export interface ChessMoveMessage {
  type: 'move';
  move: string;
}

export interface ChessGameEndMessage {
  type: 'gameEnd';
  winner: string;
  message: string;
} 