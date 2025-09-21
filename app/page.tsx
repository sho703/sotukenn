'use client';

import { GameBoard } from './components/game/game-board';
import { useMahjongDeal } from './hooks/useMahjongDeal';

export default function Home() {
  const gameState = useMahjongDeal();

  return <GameBoard {...gameState} />;
}