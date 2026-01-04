import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { GameState } from '@/types/game';
import { setGame } from '@/lib/gameStore';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
});

export async function POST(req: NextRequest) {
  try {
    const { gameId, gameState } = await req.json() as { gameId: string; gameState: GameState };

    setGame(gameId, gameState);

    await pusher.trigger(`game-${gameId}`, 'game-state-updated', gameState);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json(
      { error: 'Failed to update game' },
      { status: 500 }
    );
  }
}

