'use client';

import { CardCount, GameMode } from '@/types/game';
import { useState, useEffect } from 'react';

interface GameConfigProps {
  onStartGame: (cardCount: CardCount, playerName: string, gameMode?: GameMode, timerSeconds?: number) => void;
  onJoinGame: (gameId: string, playerName: string) => void;
  disabled: boolean;
}

export default function GameConfig({ onStartGame, onJoinGame, disabled }: GameConfigProps) {
  const [cardCount, setCardCount] = useState<CardCount>(20);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [mode, setMode] = useState<'create' | 'join' | 'single'>('create');
  const [gameMode, setGameMode] = useState<GameMode>('multiplayer');
  const [timerSeconds, setTimerSeconds] = useState<number>(180);

  useEffect(() => {
    if (mode === 'single') {
      setGameMode('singleplayer');
    } else {
      setGameMode('multiplayer');
    }
  }, [mode]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStartGame(cardCount, playerName.trim(), gameMode, gameMode === 'singleplayer' ? timerSeconds : undefined);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && gameId.trim()) {
      onJoinGame(gameId.trim(), playerName.trim());
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">Memory Card Game</h2>
      
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            mode === 'create'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={disabled}
        >
          Create Game
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            mode === 'join'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={disabled}
        >
          Join Game
        </button>
        <button
          type="button"
          onClick={() => setMode('single')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            mode === 'single'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={disabled}
        >
          Single Player
        </button>
      </div>

      {mode === 'single' ? (
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Number of Cards</label>
            <div className="flex gap-4">
              {([20, 30, 40] as CardCount[]).map((count) => (
                <label key={count} className="flex items-center">
                  <input
                    type="radio"
                    value={count}
                    checked={cardCount === count}
                    onChange={(e) => setCardCount(Number(e.target.value) as CardCount)}
                    className="mr-2"
                    disabled={disabled}
                  />
                  {count}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timer (seconds)</label>
            <input
              type="number"
              value={timerSeconds}
              onChange={(e) => setTimerSeconds(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="300"
              min="60"
              max="1800"
              required
              disabled={disabled}
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 180 seconds (3 minutes)</p>
          </div>
          <button
            type="submit"
            disabled={disabled || !playerName.trim()}
            className="w-full py-2 px-4 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Single Player Game
          </button>
        </form>
      ) : mode === 'create' ? (
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Number of Cards</label>
            <div className="flex gap-4">
              {([20, 30, 40] as CardCount[]).map((count) => (
                <label key={count} className="flex items-center">
                  <input
                    type="radio"
                    value={count}
                    checked={cardCount === count}
                    onChange={(e) => setCardCount(Number(e.target.value) as CardCount)}
                    className="mr-2"
                    disabled={disabled}
                  />
                  {count}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={disabled || !playerName.trim()}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {disabled ? 'Waiting for opponent...' : 'Start Game'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoinSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
              disabled={disabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Game ID</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter game ID"
              required
              disabled={disabled}
            />
          </div>
          <button
            type="submit"
            disabled={disabled || !playerName.trim() || !gameId.trim()}
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Join Game
          </button>
        </form>
      )}
    </div>
  );
}

