'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState } from 'react';
import { HandZone } from './hand-zone';
import { MahjongGrid } from './mahjong-grid';
import { MahjongTile } from './mahjong-tile';
import { DoraIndicator } from './dora-indicator';
import { Tile } from './types';
import { TenpaiPattern, WinningInfo, ScoreInfo, YakuAnalysis, Melds } from '@/types';
import { GameHeader } from './game-header';
import { TitleScreen } from './title-screen';
import Image from 'next/image';
import { getTileImagePath } from '@/app/lib/mahjong';
import { translateYaku } from '@/lib/yaku-translations';
import { Button } from '@/components/ui/button';

interface Props {
  // 基本状態
  handTiles: Tile[];
  poolTiles: Tile[];
  dora: string;
  gamePhase: 'title' | 'selecting' | 'playing' | 'finished' | 'draw';
  error: string | null;

  // CPU状態
  cpuState: any | null;

  // 対局状態
  playerDiscards: Tile[];
  cpuDiscards: Tile[];
  isPlayerTurn: boolean;
  isProcessingWin: boolean;

  // 和了情報
  winningInfo: WinningInfo | null;

  // スコア情報
  score: ScoreInfo;

  // 操作
  moveTile: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  reorderZone: (zone: "hand" | "pool", fromIdx: number, toIdx: number) => void;
  dealTiles: () => void;
  reset: () => void;
  completeSelection: () => void;
  analyzeTenpai: () => void;
  discardTile: (tile: Tile) => Promise<void>;
  startGame: () => void;
  nextRound: () => void;
  endGame: () => void;

  // 状態
  isAnalyzing: boolean;
  hasDealt: boolean;
  suggestions: TenpaiPattern[] | null;
  currentRound: number;
}

export function GameBoard({
  // 基本状態
  handTiles,
  poolTiles,
  dora,
  gamePhase,
  error,

  // CPU状態
  cpuState,

  // 対局状態
  playerDiscards,
  cpuDiscards,
  isPlayerTurn,
  isProcessingWin,

  // 和了情報
  winningInfo,

  // スコア情報
  score,

  // 操作
  moveTile,
  reorderZone,
  dealTiles,
  reset,
  completeSelection,
  analyzeTenpai,
  discardTile,
  startGame,
  nextRound,
  endGame,

  // 状態
  isAnalyzing,
  hasDealt,
  suggestions,
  currentRound
}: Props) {
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [activeZone, setActiveZone] = useState<"hand" | "pool" | null>(null);

  // 捨て牌履歴を表示するヘルパー関数（MahjongGridスタイル）
  const renderDiscardHistory = (discards: Tile[]) => {
    if (discards.length === 0) {
      return <div className="text-mahjong-gold-300 text-center font-japanese font-semibold">まだ捨て牌がありません</div>;
    }

    return (
      <div className="grid grid-cols-6 gap-2">
        {discards.map((tile, index) => (
          <div key={`discard-${tile.id}-${index}`}>
            <MahjongTile
              tile={tile}
              selected={false}
              index={index}
              priority={false}
            />
          </div>
        ))}
      </div>
    );
  };

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  }));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTile = [...handTiles, ...poolTiles].find(tile => tile.id === active.id);
    if (draggedTile) {
      setActiveTile(draggedTile);
      setActiveZone(handTiles.some(t => t.id === active.id) ? "hand" : "pool");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !activeZone) {
      setActiveTile(null);
      setActiveZone(null);
      return;
    }

    // ドロップ先のゾーンを判定
    const targetZone = over.data?.current?.sortable?.containerId || over.id;
    const isTargetTile = over.data?.current?.sortable?.index !== undefined;

    if (targetZone === activeZone && isTargetTile) {
      // 同じゾーン内での並び替え
      const tiles = activeZone === "hand" ? handTiles : poolTiles;
      const oldIndex = tiles.findIndex(t => t.id === active.id);
      const newIndex = tiles.findIndex(t => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderZone(activeZone, oldIndex, newIndex);
      }
    } else if (targetZone !== activeZone) {
      // 異なるゾーン間の移動
      const targetIndex = isTargetTile
        ? (targetZone === "hand" ? handTiles : poolTiles).findIndex(t => t.id === over.id)
        : undefined;
      moveTile(active.id.toString(), activeZone, targetZone as "hand" | "pool", targetIndex);
    }

    setActiveTile(null);
    setActiveZone(null);
  };

  // タイトル画面
  if (gamePhase === 'title') {
    return <TitleScreen onStartGame={startGame} />;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto p-4 relative">
        {/* 局数表示（左上） */}
        <div className="absolute top-4 left-4 bg-mahjong-gold-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-mahjong-button font-japanese font-bold text-lg border-2 border-mahjong-gold-400">
          第{currentRound}局
        </div>

        {/* スコア表示（真ん中上） */}
        <div className="text-center mb-8">
          <div className="bg-black/30 backdrop-blur-sm text-white px-8 py-4 rounded-2xl shadow-mahjong-button font-japanese font-bold text-2xl border-2 border-mahjong-gold-400/50 inline-block">
            <span className="text-mahjong-blue-300">プレイヤー</span>
            <span className="mx-4 text-mahjong-gold-300">{score.player}</span>
            <span className="text-mahjong-gold-400">:</span>
            <span className="mx-4 text-mahjong-gold-300">{score.cpu}</span>
            <span className="text-mahjong-red-300">CPU</span>
          </div>
        </div>

        <div className="space-y-8">
          {error && (
            <div className="bg-mahjong-red-500/90 backdrop-blur-sm border-2 border-mahjong-red-400 text-white px-6 py-4 rounded-xl shadow-mahjong-button font-japanese font-semibold text-center">
              ⚠️ {error}
            </div>
          )}

          {gamePhase === 'selecting' && (
            <>
              {/* 手牌選択画面のボタン */}
              <div className="flex justify-center gap-6 mb-8">
                {!hasDealt && (
                  <Button
                    onClick={dealTiles}
                    disabled={isAnalyzing}
                    variant="mahjong"
                    className="px-8 py-4 bg-gradient-to-r from-mahjong-table-600 to-mahjong-table-700 text-white rounded-xl disabled:from-gray-600 disabled:to-gray-700 border-2 border-mahjong-gold-400/50"
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.disabled) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                    }}
                  >
                    🎲 配牌する
                  </Button>
                )}
                <Button
                  onClick={analyzeTenpai}
                  disabled={!hasDealt || isAnalyzing}
                  variant="mahjong"
                  className="px-8 py-4 bg-gradient-to-r from-mahjong-blue-600 to-mahjong-blue-700 text-white rounded-xl disabled:from-gray-600 disabled:to-gray-700 border-2 border-mahjong-gold-400/50"
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                  }}
                >
                  {isAnalyzing ? '🔍 分析中...' : '💡 聴牌形提案'}
                </Button>
              </div>

              <section className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-japanese font-bold text-xl text-white">手牌選択（13枚を選んでください）</h2>
                  <div className="flex gap-3">
                    <Button
                      onClick={reset}
                      disabled={handTiles.length === 0}
                      variant="mahjong"
                      className={`px-6 py-3 rounded-xl font-semibold ${handTiles.length > 0
                        ? 'bg-gradient-to-r from-mahjong-red-600 to-mahjong-red-700 text-white border-2 border-mahjong-red-400/50'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      🔄 リセット
                    </Button>
                    <Button
                      onClick={completeSelection}
                      disabled={handTiles.length !== 13}
                      variant="mahjong"
                      className={`px-6 py-3 rounded-xl font-semibold ${handTiles.length === 13
                        ? 'bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-white border-2 border-mahjong-gold-400/50'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      ✅ 選択完了 ({handTiles.length}/13枚)
                    </Button>
                  </div>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <HandZone
                    tiles={handTiles}
                    onTileDrop={moveTile}
                    onReorder={(fromIdx, toIdx) => reorderZone('hand', fromIdx, toIdx)}
                  />
                </div>
              </section>

              <section className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-japanese font-bold text-xl text-white">牌プール</h2>
                  <DoraIndicator dora={dora} />
                </div>
                <div className="max-w-full overflow-x-auto">
                  <MahjongGrid
                    tiles={poolTiles}
                    onTileDrop={moveTile}
                    onReorder={(fromIdx, toIdx) => reorderZone('pool', fromIdx, toIdx)}
                  />
                </div>
              </section>
            </>
          )}

          {gamePhase === 'playing' && (
            <>
              {/* 手番表示 */}
              <div className={`p-6 rounded-2xl text-center font-japanese font-bold text-xl shadow-mahjong-button border-2 ${isProcessingWin
                ? 'bg-gradient-to-r from-mahjong-gold-500 to-mahjong-gold-600 text-white border-mahjong-gold-400'
                : isPlayerTurn
                  ? 'bg-gradient-to-r from-mahjong-blue-500 to-mahjong-blue-600 text-white border-mahjong-blue-400'
                  : 'bg-gradient-to-r from-mahjong-red-500 to-mahjong-red-600 text-white border-mahjong-red-400'
                }`}>
                {isProcessingWin ? '🔍 和了判定中...' :
                  isPlayerTurn ? '🎯 あなたの番です' : '🤖 CPUの番です'}
              </div>

              {/* CPU手牌 */}
              <section className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <h2 className="mb-4 font-japanese font-bold text-xl text-white">CPU手牌</h2>
                <div className="flex gap-1 bg-mahjong-ivory-500/20 p-4 rounded-xl border-2 border-mahjong-ivory-400/30">
                  {Array.from({ length: 13 }, (_, i) => (
                    <div
                      key={i}
                      className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 bg-mahjong-ivory-500 rounded-lg border-2 border-mahjong-ivory-600 shadow-mahjong-tile"
                    />
                  ))}
                </div>
              </section>

              {/* 捨て牌履歴 */}
              <div className="grid grid-cols-2 gap-8">
                <section className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                  <h2 className="mb-4 font-japanese font-bold text-xl text-mahjong-blue-300">あなたの捨て牌</h2>
                  <div className="bg-mahjong-blue-500/20 p-4 rounded-xl min-h-20 border-2 border-mahjong-blue-400/30">
                    {renderDiscardHistory(playerDiscards)}
                  </div>
                </section>
                <section className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                  <h2 className="mb-4 font-japanese font-bold text-xl text-mahjong-red-300">CPUの捨て牌</h2>
                  <div className="bg-mahjong-red-500/20 p-4 rounded-xl min-h-20 border-2 border-mahjong-red-400/30">
                    {renderDiscardHistory(cpuDiscards)}
                  </div>
                </section>
              </div>

              {/* プレイヤーの手牌 */}
              <section className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-japanese font-bold text-xl text-mahjong-blue-300">あなたの手牌</h2>
                  <DoraIndicator dora={dora} />
                </div>
                <div className="flex gap-2 bg-mahjong-blue-500/20 p-4 rounded-xl border-2 border-mahjong-blue-400/30">
                  {handTiles.map((tile, index) => (
                    <MahjongTile
                      key={`hand-${tile.id}-${index}`}
                      tile={tile}
                      selected
                      index={index}
                      priority={true}
                    />
                  ))}
                </div>
              </section>

              {/* 選択可能な捨て牌 */}
              <section className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <h2 className="mb-4 font-japanese font-bold text-xl text-white">
                  捨て牌を選択してください（{poolTiles.length}枚）
                  {isProcessingWin ? <span className="text-mahjong-gold-300 ml-2">（和了判定中...）</span> :
                    !isPlayerTurn && <span className="text-gray-400 ml-2">（CPUの番です）</span>}
                </h2>
                <div className="flex flex-wrap gap-2 bg-mahjong-gold-500/20 p-4 rounded-xl border-2 border-mahjong-gold-400/30">
                  {poolTiles.map((tile, index) => (
                    <div
                      key={`pool-${tile.id}-${index}`}
                      onClick={() => {
                        if (isPlayerTurn && !isProcessingWin) {
                          discardTile(tile);
                        }
                      }}
                      className={`${isPlayerTurn && !isProcessingWin
                        ? 'cursor-pointer hover:opacity-75 hover:scale-105 transition-all'
                        : 'cursor-not-allowed opacity-50'
                        }`}
                    >
                      <MahjongTile
                        tile={tile}
                        selected={false}
                        index={index}
                        priority={false}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* 和了表示 */}
          {gamePhase === 'finished' && winningInfo && (
            <section className="mt-8">
              <div className={`p-8 rounded-2xl text-center shadow-mahjong-tile-hover border-4 font-japanese ${winningInfo.winner === 'player'
                ? 'bg-gradient-to-br from-mahjong-blue-500 to-mahjong-blue-700 border-mahjong-blue-400'
                : 'bg-gradient-to-br from-mahjong-red-500 to-mahjong-red-700 border-mahjong-red-400'
                }`}>
                <h2 className="text-4xl font-bold mb-6 text-white">
                  {winningInfo.winner === 'player' ? '🎉 あなたの和了！' : '😔 CPUの和了'}
                </h2>

                {/* 勝利判定 */}
                {(score.player >= 5 || score.cpu >= 5) && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-mahjong-gold-500 to-mahjong-gold-600 border-4 border-mahjong-gold-400 rounded-2xl shadow-mahjong-button">
                    <h3 className="text-3xl font-bold text-white mb-2 font-japanese">
                      🏆 ゲーム終了！
                    </h3>
                    <p className="text-xl text-white font-japanese">
                      {score.player >= 5 ? 'プレイヤーの勝利！' : 'CPUの勝利！'}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  {/* ポイント表示 */}
                  <div className="text-3xl font-bold mb-6 text-mahjong-gold-300 font-japanese">
                    {winningInfo.han ? `${winningInfo.han}ポイント` : '1ポイント'}
                  </div>

                  {/* 最終形表示 */}
                  <div className="mb-6">
                    <div className="font-japanese font-bold mb-4 text-white text-xl">最終形：</div>
                    <div className="flex justify-center items-center gap-1 mb-4 bg-mahjong-ivory-500/20 p-4 rounded-xl border-2 border-mahjong-ivory-400/30">
                      {winningInfo.winner === 'player' ?
                        // プレイヤーの最終形（手牌 + 和了牌）
                        [...handTiles, { id: 'winning-player', type: winningInfo.winningTile, imagePath: getTileImagePath(winningInfo.winningTile) }].map((tile, index) => (
                          <div key={tile.id || index} className="w-8 h-12">
                            <div className="relative w-full h-full">
                              <Image
                                src={tile.imagePath}
                                alt={tile.type}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )) :
                        // CPUの最終形（手牌 + 和了牌）
                        [...(cpuState?.handTiles || []), { id: 'winning-cpu', type: winningInfo.winningTile, imagePath: getTileImagePath(winningInfo.winningTile) }].map((tile, index) => (
                          <div key={tile.id || index} className="w-8 h-12">
                            <div className="relative w-full h-full">
                              <Image
                                src={tile.imagePath}
                                alt={tile.type}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    <div className="text-lg text-mahjong-gold-200 font-japanese font-semibold">
                      和了牌: {winningInfo.winningTile}
                    </div>
                  </div>

                  {/* 成立役表示 */}
                  <div className="mb-6">
                    <div className="font-japanese font-bold mb-4 text-white text-xl">成立した役：</div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {translateYaku(winningInfo.yaku).map((yaku, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-mahjong-gold-500/90 text-white rounded-full text-sm font-japanese font-semibold border-2 border-mahjong-gold-400 shadow-mahjong-tile"
                        >
                          {yaku}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-6">
                  {score.player >= 5 || score.cpu >= 5 ? (
                    <Button
                      onClick={endGame}
                      variant="mahjong"
                      className="px-8 py-4 bg-gradient-to-r from-mahjong-table-700 to-mahjong-table-800 text-white rounded-xl border-2 border-mahjong-gold-400/50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      🏠 タイトルに戻る
                    </Button>
                  ) : (
                    <Button
                      onClick={nextRound}
                      variant="mahjong"
                      className="px-8 py-4 bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-white rounded-xl border-2 border-mahjong-gold-400/50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      ➡️ 次の局へ
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 流局表示 */}
          {gamePhase === 'draw' && (
            <section className="mt-8">
              <div className="p-8 rounded-2xl text-center bg-gradient-to-br from-mahjong-table-600 to-mahjong-table-700 border-4 border-mahjong-gold-400 shadow-mahjong-tile-hover font-japanese">
                <h2 className="text-4xl font-bold mb-6 text-white">🀄 流局（引き分け）</h2>
                <div className="text-xl mb-8 text-mahjong-gold-200">
                  <div className="mb-3">捨て牌候補が尽きました</div>
                  <div className="mb-3">プレイヤー：{playerDiscards.length}枚捨て牌</div>
                  <div className="mb-3">CPU：{cpuDiscards.length}枚捨て牌</div>
                  <div className="text-lg text-mahjong-gold-300 mt-6 font-semibold">
                    ポイントは加算されません
                  </div>
                </div>
                <div className="flex justify-center gap-6">
                  {score.player >= 5 || score.cpu >= 5 ? (
                    <Button
                      onClick={endGame}
                      variant="mahjong"
                      className="px-8 py-4 bg-gradient-to-r from-mahjong-table-700 to-mahjong-table-800 text-white rounded-xl border-2 border-mahjong-gold-400/50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      🏠 タイトルに戻る
                    </Button>
                  ) : (
                    <Button
                      onClick={nextRound}
                      variant="mahjong"
                      className="px-8 py-4 bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-white rounded-xl border-2 border-mahjong-gold-400/50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      ➡️ 次の局へ
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}

          {suggestions && suggestions.length > 0 && gamePhase !== 'playing' && (
            <section className="mt-8">
              <h2 className="text-3xl font-bold mb-6 text-white font-japanese text-center">🤖 AIアシスタント提案</h2>
              <div className="space-y-8">
                {/* AI分析結果の表示 */}
                {suggestions.length > 0 && suggestions[0].analysis && (
                  <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl shadow-mahjong-tile border-2 border-mahjong-gold-400/30 mb-8">
                    <h3 className="text-xl font-japanese font-bold mb-4 text-mahjong-gold-300 text-center">
                      AI分析結果 {suggestions[0].source === 'gemini' && <span className="text-sm text-mahjong-gold-400">(Gemini AI)</span>}
                    </h3>
                    <div className="bg-mahjong-table-500/20 p-4 rounded-xl border-2 border-mahjong-table-400/30">
                      <div className="whitespace-pre-wrap text-mahjong-ivory-200 leading-relaxed">
                        {suggestions[0].analysis}
                      </div>
                    </div>
                  </div>
                )}

                {/* 役の分析結果の表示 */}
                {suggestions.length > 0 && suggestions[0].yakuAnalysis && suggestions[0].yakuAnalysis.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {suggestions[0].yakuAnalysis.map((yaku: any, yakuIndex: number) => (
                      <div key={yakuIndex} className="bg-black/30 backdrop-blur-sm p-4 rounded-xl shadow-mahjong-tile border-2 border-mahjong-gold-400/30">
                        <div className="mb-3">
                          <h3 className="text-lg font-japanese font-bold text-mahjong-gold-300">
                            {yakuIndex === 0 ? '①' : yakuIndex === 1 ? '②' : yakuIndex === 2 ? '③' : yakuIndex === 3 ? '④' : yakuIndex === 4 ? '⑤' : `${yakuIndex + 1}.`}{yaku.yakuName}
                          </h3>
                          <div className="mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-japanese font-semibold ${yaku.possibility === '高い' ? 'bg-red-500/90 text-white' :
                              yaku.possibility === '中程度' ? 'bg-yellow-500/90 text-white' :
                                'bg-gray-500/90 text-white'
                              }`}>
                              {yaku.possibility}
                            </span>
                          </div>
                        </div>
                        <div className="text-mahjong-ivory-200 leading-relaxed text-sm">
                          {yaku.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 事前計算された面子情報の表示（一か所だけ） */}
                {suggestions.length > 0 && suggestions[0].melds && (
                  <div className="mt-8">
                    <h3 className="text-xl font-japanese font-bold mb-4 text-mahjong-gold-300 text-center">
                      作れる面子
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 順子 */}
                      {suggestions[0].melds.sequences.length > 0 && (
                        <div className="bg-mahjong-table-500/20 p-4 rounded-xl border-2 border-mahjong-table-400/30">
                          <p className="text-sm text-mahjong-gold-300 font-semibold mb-3 text-center">順子 ({suggestions[0].melds.sequences.length}個)</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {suggestions[0].melds.sequences.map((sequence: string[], idx: number) => (
                              <div key={idx} className="flex gap-1">
                                {sequence.map((tile: string, tileIdx: number) => (
                                  <div key={tileIdx} className="inline-flex w-8 h-10">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={getTileImagePath(tile)}
                                        alt={tile}
                                        fill
                                        sizes="32px"
                                        className="object-contain"
                                        priority={false}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 刻子 */}
                      {suggestions[0].melds.triplets.length > 0 && (
                        <div className="bg-mahjong-table-500/20 p-4 rounded-xl border-2 border-mahjong-table-400/30">
                          <p className="text-sm text-mahjong-gold-300 font-semibold mb-3 text-center">刻子 ({suggestions[0].melds.triplets.length}個)</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {suggestions[0].melds.triplets.map((triplet: string[], idx: number) => (
                              <div key={idx} className="flex gap-1">
                                {triplet.map((tile: string, tileIdx: number) => (
                                  <div key={tileIdx} className="inline-flex w-8 h-10">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={getTileImagePath(tile)}
                                        alt={tile}
                                        fill
                                        sizes="32px"
                                        className="object-contain"
                                        priority={false}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 対子 */}
                      {suggestions[0].melds.pairs.length > 0 && (
                        <div className="bg-mahjong-table-500/20 p-4 rounded-xl border-2 border-mahjong-table-400/30">
                          <p className="text-sm text-mahjong-gold-300 font-semibold mb-3 text-center">対子 ({suggestions[0].melds.pairs.length}個)</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {suggestions[0].melds.pairs.map((pair: string[], idx: number) => (
                              <div key={idx} className="flex gap-1">
                                {pair.map((tile: string, tileIdx: number) => (
                                  <div key={tileIdx} className="inline-flex w-8 h-10">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={getTileImagePath(tile)}
                                        alt={tile}
                                        fill
                                        sizes="32px"
                                        className="object-contain"
                                        priority={false}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 塔子（ターツ） */}
                      {suggestions[0].melds.taatsu.length > 0 && (
                        <div className="bg-mahjong-table-500/20 p-4 rounded-xl border-2 border-mahjong-table-400/30">
                          <p className="text-sm text-mahjong-gold-300 font-semibold mb-3 text-center">塔子 ({suggestions[0].melds.taatsu.length}個)</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {suggestions[0].melds.taatsu.map((taatsu: string[], idx: number) => (
                              <div key={idx} className="flex gap-1">
                                {taatsu.map((tile: string, tileIdx: number) => (
                                  <div key={tileIdx} className="inline-flex w-8 h-10">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={getTileImagePath(tile)}
                                        alt={tile}
                                        fill
                                        sizes="32px"
                                        className="object-contain border-2 border-blue-400 rounded"
                                        priority={false}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <DragOverlay>
          {activeTile ? <MahjongTile tile={activeTile} selected={activeZone === "hand"} index={0} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
} 