'use client';

import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher {
  if (pusherClient) {
    return pusherClient;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

  if (!key) {
    throw new Error('NEXT_PUBLIC_PUSHER_KEY is not set');
  }

  pusherClient = new Pusher(key, {
    cluster,
    authEndpoint: '/api/pusher/auth',
  });

  return pusherClient;
}

