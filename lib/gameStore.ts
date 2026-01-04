import { GameState } from '@/types/game';

export const games = new Map<string, GameState>();

export function getGame(gameId: string): GameState | undefined {
  return games.get(gameId);
}

export function setGame(gameId: string, gameState: GameState): void {
  games.set(gameId, gameState);
}

export function deleteGame(gameId: string): void {
  games.delete(gameId);
}

