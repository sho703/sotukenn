'use client';

import { GameBoard } from './components/game/game-board';
import { useMahjongDeal } from './hooks/useMahjongDeal';

export default function Home() {
  const {
    handTiles,
    poolTiles,
    dora,
    moveTile,
    reorderZone,
    dealTiles,
    reset,
    analyzeTenpai,
    isAnalyzing,
    hasDealt,
    error,
    suggestions
  } = useMahjongDeal();

  return (
    <GameBoard
      handTiles={handTiles}
      poolTiles={poolTiles}
      dora={dora}
      moveTile={moveTile}
      reorderZone={reorderZone}
      dealTiles={dealTiles}
      reset={reset}
      analyzeTenpai={analyzeTenpai}
      isAnalyzing={isAnalyzing}
      hasDealt={hasDealt}
      error={error}
      suggestions={suggestions}
    />
  );
}