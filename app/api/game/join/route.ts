import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { GameState, Player } from '@/types/game';
import { getGame, setGame } from '@/lib/gameStore';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
});

export async function POST(req: NextRequest) {
  try {
    const { gameId, playerId, playerName, cardCount, gameState: existingState } = await req.json();

    let gameState: GameState;

    if (existingState) {
      gameState = existingState;
      setGame(gameId, gameState);
    } else {
      gameState = getGame(gameId) || {
        id: gameId,
        status: 'waiting' as const,
        cards: [],
        players: [],
        currentPlayerId: null,
        flippedCards: [],
        cardCount: 20 as const,
        winnerId: null,
        mode: 'multiplayer' as const,
      };

      if (gameState.players.length >= 2) {
        return NextResponse.json(
          { error: 'Game is full' },
          { status: 400 }
        );
      }

      const newPlayer: Player = {
        id: playerId,
        name: playerName,
        score: 0,
      };

      gameState = {
        ...gameState,
        players: [...gameState.players, newPlayer],
      };

      setGame(gameId, gameState);

      await pusher.trigger(`game-${gameId}`, 'player-joined', {
        player: newPlayer,
        gameState,
      });
    }

    return NextResponse.json({ success: true, gameState });
  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}

