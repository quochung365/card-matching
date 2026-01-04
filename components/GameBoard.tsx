'use client';

import { GameState } from '@/types/game';
import Card from './Card';

interface GameBoardProps {
  gameState: GameState;
  onCardClick: (cardId: string) => void;
  isMyTurn: boolean;
}

export default function GameBoard({ gameState, onCardClick, isMyTurn }: GameBoardProps) {
  const gridCols = gameState.cardCount === 20 ? 'grid-cols-5' : gameState.cardCount === 30 ? 'grid-cols-6' : 'grid-cols-8';

  const getMatchedByPlayerName = (card: typeof gameState.cards[0]) => {
    if (!card.matchedBy) return null;
    const player = gameState.players.find(p => p.id === card.matchedBy);
    return player?.name || null;
  };

  return (
    <div className={`grid ${gridCols} gap-4 w-full max-w-4xl mx-auto`}>
      {gameState.cards.map((card) => (
        <div key={card.id} className="aspect-square relative">
          <Card
            card={card}
            onClick={() => onCardClick(card.id)}
            disabled={!isMyTurn || gameState.flippedCards.length >= 2}
            matchedByPlayerName={getMatchedByPlayerName(card)}
          />
        </div>
      ))}
    </div>
  );
}

