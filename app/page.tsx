'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, CardCount, Player, GameMode } from '@/types/game';
import { flipCard, checkMatch, createInitialGameState } from '@/lib/gameLogic';
import GameConfig from '@/components/GameConfig';
import GameBoard from '@/components/GameBoard';
import PlayerInfo from '@/components/PlayerInfo';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMyPlayerId(playerId);

    return () => {
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameState?.mode === 'singleplayer' && gameState.status === 'playing' && gameState.timer !== undefined && gameState.timerStartTime && gameState.initialTimer !== undefined) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        setGameState((prevState) => {
          if (!prevState || prevState.mode !== 'singleplayer' || prevState.timer === undefined || !prevState.timerStartTime || prevState.initialTimer === undefined) {
            return prevState;
          }

          const elapsed = Math.floor((Date.now() - prevState.timerStartTime) / 1000);
          const remaining = Math.max(0, prevState.initialTimer - elapsed);

          if (remaining <= 0) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            return {
              ...prevState,
              status: 'finished',
              timer: 0,
            };
          }

          return {
            ...prevState,
            timer: remaining,
          };
        });
      }, 100);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [gameState?.mode, gameState?.status, gameState?.timer, gameState?.timerStartTime, gameState?.initialTimer]);

  const handleStartGame = useCallback(async (cardCount: CardCount, playerName: string, gameMode?: GameMode, timerSeconds?: number) => {
    if (!myPlayerId) return;

    const mode = gameMode || 'multiplayer';
    const gameId = `game-${Date.now()}`;
    const initialState = createInitialGameState(gameId, myPlayerId, playerName, cardCount, mode, timerSeconds);
    
    setGameState(initialState);
    
    if (mode === 'singleplayer') {
      setIsWaiting(false);
      return;
    }

    setIsWaiting(true);

    const { getPusherClient } = await import('@/lib/pusher');
    const pusher = getPusherClient();
    const gameChannel = pusher.subscribe(`game-${gameId}`);

    gameChannel.bind('game-state-updated', (data: GameState) => {
      setGameState(data);
      if (data.status === 'playing' && data.players.length === 2) {
        setIsWaiting(false);
      }
    });

    gameChannel.bind('player-joined', (data: { player: Player; gameState: GameState }) => {
      setGameState(data.gameState);
      if (data.gameState.players.length === 2) {
        const updatedState = {
          ...data.gameState,
          status: 'playing' as const,
          currentPlayerId: data.gameState.players[0].id,
        };
        setGameState(updatedState);
        setIsWaiting(false);
        
        fetch('/api/game/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, gameState: updatedState }),
        });
      }
    });

    setChannel(gameChannel);

    fetch('/api/game/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        playerId: myPlayerId,
        playerName,
        cardCount,
        gameState: initialState,
      }),
    });
  }, [myPlayerId]);

  const handleCardClick = useCallback((cardId: string) => {
    if (!gameState || !myPlayerId) return;
    if (gameState.mode === 'multiplayer' && !channel) return;
    if (gameState.currentPlayerId !== myPlayerId) return;
    if (gameState.flippedCards.length >= 2) return;
    if (gameState.status !== 'playing') return;

    let updatedState = flipCard(gameState, cardId);
    setGameState(updatedState);

    if (gameState.mode === 'multiplayer') {
      fetch('/api/game/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameState.id,
          gameState: updatedState,
        }),
      });
    }

    if (updatedState.flippedCards.length === 2) {
      setTimeout(() => {
        const { isMatch, newState } = checkMatch(updatedState);
        
        setGameState(newState);

        if (newState.mode === 'multiplayer') {
        fetch('/api/game/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: gameState.id,
            gameState: newState,
          }),
        });
        }
      }, 1000);
    }
  }, [gameState, myPlayerId, channel]);

  const handleJoinGame = useCallback(async (gameId: string, playerName: string) => {
    if (!myPlayerId) return;

    setIsWaiting(true);

    const { getPusherClient } = await import('@/lib/pusher');
    const pusher = getPusherClient();
    const gameChannel = pusher.subscribe(`game-${gameId}`);

    gameChannel.bind('game-state-updated', (data: GameState) => {
      setGameState(data);
      setIsWaiting(false);
    });

    gameChannel.bind('player-joined', (data: { player: Player; gameState: GameState }) => {
      setGameState(data.gameState);
      if (data.gameState.players.length === 2) {
        const updatedState = {
          ...data.gameState,
          status: 'playing' as const,
          currentPlayerId: data.gameState.players[0].id,
        };
        setGameState(updatedState);
        setIsWaiting(false);
      }
    });

    setChannel(gameChannel);

    fetch('/api/game/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        playerId: myPlayerId,
        playerName,
      }),
    }).then(res => res.json()).then(data => {
      if (data.gameState) {
        setGameState(data.gameState);
        if (data.gameState.players.length === 2) {
          setIsWaiting(false);
        }
      }
    }).catch(err => {
      console.error('Error joining game:', err);
      setIsWaiting(false);
    });
  }, [myPlayerId]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <GameConfig 
          onStartGame={handleStartGame} 
          onJoinGame={handleJoinGame}
          disabled={false} 
        />
      </div>
    );
  }

  const myPlayer = gameState.players.find(p => p.id === myPlayerId);
  const isMyTurn = gameState.currentPlayerId === myPlayerId && gameState.status === 'playing';
  const isSinglePlayer = gameState.mode === 'singleplayer';

  const formatTime = (seconds: number | undefined) => {
    if (seconds === undefined) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Memory Card Game</h1>
        
        {isSinglePlayer && gameState.timer !== undefined && gameState.status === 'playing' && (
          <div className={`mb-4 text-center px-4 py-3 rounded ${
            gameState.timer <= 30 
              ? 'bg-red-100 border border-red-400 text-red-700' 
              : 'bg-blue-100 border border-blue-400 text-blue-700'
          }`}>
            <h2 className="text-2xl font-bold">Time Remaining: {formatTime(gameState.timer)}</h2>
          </div>
        )}

        {isWaiting && !isSinglePlayer && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-center">
            Waiting for another player to join...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {gameState.players.map((player) => (
            <PlayerInfo
              key={player.id}
              player={player}
              gameState={gameState}
              isCurrentPlayer={gameState.currentPlayerId === player.id}
              isMe={player.id === myPlayerId}
            />
          ))}
        </div>

        <div className="relative">
          <GameBoard
            gameState={gameState}
            onCardClick={handleCardClick}
            isMyTurn={isMyTurn}
          />
          
          {gameState.status === 'finished' && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg z-10">
              <div className={`bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4 text-center ${
                isSinglePlayer && gameState.timer === 0
                  ? 'border-4 border-red-400'
                  : 'border-4 border-green-400'
              }`}>
                <h2 className={`text-4xl font-bold mb-4 ${
                  isSinglePlayer && gameState.timer === 0
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {isSinglePlayer && gameState.timer === 0
                    ? 'Time\'s Up!'
                    : gameState.winnerId === myPlayerId 
                      ? '🎉 You Win! 🎉' 
                      : 'Game Over!'}
                </h2>
                {gameState.winnerId && (
                  <p className="text-xl mb-2">
                    Winner: <span className="font-bold text-blue-600">
                      {gameState.players.find(p => p.id === gameState.winnerId)?.name}
                    </span>
                  </p>
                )}
                {isSinglePlayer && myPlayer && (
                  <p className="text-lg mt-4">
                    Your Score: <span className="font-bold text-purple-600">
                      {myPlayer.score} / {gameState.cardCount / 2}
                    </span> pairs
                  </p>
                )}
                {!isSinglePlayer && (
                  <div className="mt-4 space-y-2">
                    {gameState.players.map((player) => (
                      <p key={player.id} className="text-lg">
                        {player.name}: <span className="font-bold">{player.score}</span> pairs
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {gameState.status === 'waiting' && gameState.players.length === 1 && !isSinglePlayer && (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg mb-4">Share this game ID with a friend:</p>
            <p className="text-2xl font-bold text-blue-600 mb-4">{gameState.id}</p>
            <p className="text-sm text-gray-600">Or wait for someone to join automatically...</p>
          </div>
        )}
      </div>
    </div>
  );
}
