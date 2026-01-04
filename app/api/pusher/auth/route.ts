import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
});

export async function POST(req: NextRequest) {
  const { socket_id, channel_name } = await req.json();

  try {
    const auth = pusher.authorizeChannel(socket_id, channel_name);
    return NextResponse.json(auth);
  } catch (error) {
    return NextResponse.json(
      { error: 'Authorization failed' },
      { status: 403 }
    );
  }
}

