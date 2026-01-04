export type CardCount = 20 | 30 | 40;
export type GameMode = 'multiplayer' | 'singleplayer';

export interface Card {
  id: string;
  value: string; // The image path for matching pairs
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy?: string | null; // Player ID who matched this card
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  id: string;
  status: GameStatus;
  cards: Card[];
  players: Player[];
  currentPlayerId: string | null;
  flippedCards: string[]; // Card IDs that are currently flipped
  cardCount: CardCount;
  winnerId: string | null;
  mode?: GameMode; // 'multiplayer' or 'singleplayer'
  timer?: number; // Time remaining in seconds (for single player mode)
  timerStartTime?: number;
  initialTimer?: number; 
}

