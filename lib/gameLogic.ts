import { Card, CardCount, GameState, GameMode } from '@/types/game';

const AVAILABLE_IMAGES = Array.from({ length: 21 }, (_, i) => `/images/${i + 1}.jpeg`);

export function generateCards(count: CardCount): Card[] {
  const pairs = count / 2;
  const cards: Card[] = [];
  
  const selectedImages = [...AVAILABLE_IMAGES];
  for (let i = selectedImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selectedImages[i], selectedImages[j]] = [selectedImages[j], selectedImages[i]];
  }
  
  for (let i = 0; i < pairs; i++) {
    const imagePath = selectedImages[i];
    const card1: Card = {
      id: `card-${i}-1`,
      value: imagePath,
      isFlipped: false,
      isMatched: false,
    };
    const card2: Card = {
      id: `card-${i}-2`,
      value: imagePath,
      isFlipped: false,
      isMatched: false,
    };
    cards.push(card1, card2);
  }
  
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  return cards;
}

export function flipCard(gameState: GameState, cardId: string): GameState {
  const card = gameState.cards.find(c => c.id === cardId);
  if (!card || card.isMatched || card.isFlipped || gameState.flippedCards.length >= 2) {
    return gameState;
  }

  const updatedCards = gameState.cards.map(c =>
    c.id === cardId ? { ...c, isFlipped: true } : c
  );

  return {
    ...gameState,
    cards: updatedCards,
    flippedCards: [...gameState.flippedCards, cardId],
  };
}

export function checkMatch(gameState: GameState): { isMatch: boolean; newState: GameState } {
  if (gameState.flippedCards.length !== 2) {
    return { isMatch: false, newState: gameState };
  }

  const [card1Id, card2Id] = gameState.flippedCards;
  const card1 = gameState.cards.find(c => c.id === card1Id);
  const card2 = gameState.cards.find(c => c.id === card2Id);

  if (!card1 || !card2) {
    return { isMatch: false, newState: gameState };
  }

  const isMatch = card1.value === card2.value;

  if (isMatch) {
    const matchedBy = gameState.currentPlayerId;
    const updatedCards = gameState.cards.map(c =>
      c.id === card1Id || c.id === card2Id
        ? { ...c, isMatched: true, isFlipped: true, matchedBy }
        : c
    );

    const updatedPlayers = gameState.players.map(p =>
      p.id === gameState.currentPlayerId ? { ...p, score: p.score + 1 } : p
    );

    const allMatched = updatedCards.every(c => c.isMatched);
    const winnerId = allMatched
      ? updatedPlayers.reduce((max, p) => (p.score > max.score ? p : max), updatedPlayers[0]).id
      : null;

    return {
      isMatch: true,
      newState: {
        ...gameState,
        cards: updatedCards,
        players: updatedPlayers,
        flippedCards: [],
        status: allMatched ? 'finished' : gameState.status,
        winnerId,
      },
    };
  } else {
    const updatedCards = gameState.cards.map(c =>
      gameState.flippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
    );

    let nextPlayerId = gameState.currentPlayerId;
    if (gameState.mode === 'multiplayer') {
    const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
      nextPlayerId = gameState.players[nextPlayerIndex].id;
    }

    return {
      isMatch: false,
      newState: {
        ...gameState,
        cards: updatedCards,
        flippedCards: [],
        currentPlayerId: nextPlayerId,
      },
    };
  }
}

export function createInitialGameState(
  gameId: string,
  player1Id: string,
  player1Name: string,
  cardCount: CardCount,
  mode: GameMode = 'multiplayer',
  timerSeconds?: number
): GameState {
  const initialState: GameState = {
    id: gameId,
    status: mode === 'singleplayer' ? 'playing' : 'waiting',
    cards: generateCards(cardCount),
    players: [
      { id: player1Id, name: player1Name, score: 0 },
    ],
    currentPlayerId: mode === 'singleplayer' ? player1Id : null,
    flippedCards: [],
    cardCount,
    winnerId: null,
    mode,
  };

  if (mode === 'singleplayer' && timerSeconds) {
    initialState.timer = timerSeconds;
    initialState.initialTimer = timerSeconds;
    initialState.timerStartTime = Date.now();
  }

  return initialState;
}

