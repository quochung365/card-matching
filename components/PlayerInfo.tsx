'use client';

import { Player, GameState } from '@/types/game';

interface PlayerInfoProps {
  player: Player;
  gameState: GameState;
  isCurrentPlayer: boolean;
  isMe: boolean;
}

export default function PlayerInfo({ player, gameState, isCurrentPlayer, isMe }: PlayerInfoProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isCurrentPlayer
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50'
      } ${isMe ? 'ring-2 ring-purple-400' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">
            {player.name} {isMe && '(You)'}
          </h3>
          <p className="text-sm text-gray-600">Score: {player.score}</p>
        </div>
        {isCurrentPlayer && (
          <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
            Turn
          </div>
        )}
      </div>
    </div>
  );
}

