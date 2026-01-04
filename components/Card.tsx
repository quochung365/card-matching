'use client';

import { Card as CardType } from '@/types/game';

interface CardProps {
  card: CardType;
  onClick: () => void;
  disabled: boolean;
  matchedByPlayerName?: string | null;
}

export default function Card({ card, onClick, disabled, matchedByPlayerName }: CardProps) {
  if (card.isMatched) {
    return (
      <div className="relative flex items-center justify-center w-full h-full rounded-lg border-4 border-yellow-400 shadow-lg overflow-hidden">
        <img 
          src={card.value} 
          alt="Matched card" 
          className="w-full h-full object-cover"
        />
        {matchedByPlayerName && (
          <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 bg-opacity-90 text-xs font-bold text-center py-1 px-2 text-yellow-900">
            {matchedByPlayerName}
          </div>
        )}
      </div>
    );
  }

  if (card.isFlipped) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-blue-100 rounded-lg border-2 border-blue-400 cursor-pointer hover:bg-blue-200 transition-colors overflow-hidden">
        <img 
          src={card.value} 
          alt="Card" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex items-center justify-center w-full h-full rounded-lg border-2 border-gray-500 cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(255, 255, 255, 0.3) 8px,
            rgba(255, 255, 255, 0.3) 16px
          )`,
        }}
      />
      
      <div className="absolute top-2 left-2 w-6 h-6 border-2 border-white opacity-30 rounded-sm" />
      <div className="absolute top-2 right-2 w-6 h-6 border-2 border-white opacity-30 rounded-sm" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-2 border-white opacity-30 rounded-sm" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-2 border-white opacity-30 rounded-sm" />
      
      <div className="relative z-10 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-white opacity-40 group-hover:opacity-60 transition-opacity" />
        <div className="absolute w-10 h-10 rounded-full border-2 border-white opacity-50" />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  );
}

