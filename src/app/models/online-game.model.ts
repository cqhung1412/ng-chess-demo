export type GameStatus = 'waiting' | 'playing' | 'completed' | 'rematch_requested' | 'rematch_accepted';
export type PlayerColor = 'white' | 'black';

export interface OnlineGame {
  id: string;
  board: string; // FEN string representation of the board
  currentPlayer: PlayerColor;
  status: GameStatus;
  whitePlayer: string | null;
  blackPlayer: string | null;
  createdAt: number;
  lastMoveAt: number;
  winner?: PlayerColor;
  gameCode: string;
}

export interface GameMove {
  from: string;
  to: string;
  piece: string;
  color: PlayerColor;
  timestamp: number;
}

export interface GamePlayer {
  id: string;
  name: string;
  color: PlayerColor;
  isReady: boolean;
}

export interface GameState {
  game: OnlineGame;
  players: {
    white: GamePlayer | null;
    black: GamePlayer | null;
  };
  moves: GameMove[];
} 