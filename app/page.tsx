'use client';

import { GameBoard } from './components/game/game-board';
import { useMahjongDeal } from './hooks/useMahjongDeal';

export default function Home() {
  const {
    // 基本状態
    handTiles,
    poolTiles,
    dora,
    gamePhase,
    error,

    // 対局状態
    playerDiscards,
    cpuDiscards,
    isPlayerTurn,
    isProcessingWin,

    // 和了情報
    winningInfo,

    // 操作
    moveTile,
    reorderZone,
    dealTiles,
    reset,
    completeSelection,
    analyzeTenpai,
    discardTile,

    // 状態
    isAnalyzing,
    hasDealt,
    suggestions
  } = useMahjongDeal();

  return (
    <GameBoard
      // 基本状態
      handTiles={handTiles}
      poolTiles={poolTiles}
      dora={dora}
      gamePhase={gamePhase}
      error={error}

      // 対局状態
      playerDiscards={playerDiscards}
      cpuDiscards={cpuDiscards}
      isPlayerTurn={isPlayerTurn}
      isProcessingWin={isProcessingWin}

      // 和了情報
      winningInfo={winningInfo}

      // 操作
      moveTile={moveTile}
      reorderZone={reorderZone}
      dealTiles={dealTiles}
      reset={reset}
      completeSelection={completeSelection}
      analyzeTenpai={analyzeTenpai}
      discardTile={discardTile}

      // 状態
      isAnalyzing={isAnalyzing}
      hasDealt={hasDealt}
      suggestions={suggestions}
    />
  );
}