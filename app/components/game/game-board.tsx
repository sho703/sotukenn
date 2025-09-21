'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState } from 'react';
import { HandZone } from './hand-zone';
import { MahjongGrid } from './mahjong-grid';
import { MahjongTile } from './mahjong-tile';
import { DoraIndicator } from './dora-indicator';
import { Tile } from './types';
import { TenpaiPattern, WinningInfo } from '@/types';
import { GameHeader } from './game-header';
import Image from 'next/image';
import { getTileImagePath } from '@/lib/mahjong';

interface Props {
  // 基本状態
  handTiles: Tile[];
  poolTiles: Tile[];
  dora: string;
  gamePhase: 'initial' | 'selecting' | 'playing' | 'finished';
  error: string | null;

  // 対局状態
  playerDiscards: Tile[];
  cpuDiscards: Tile[];
  isPlayerTurn: boolean;
  isProcessingWin: boolean;

  // 和了情報
  winningInfo: WinningInfo | null;

  // 操作
  moveTile: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  reorderZone: (zone: "hand" | "pool", fromIdx: number, toIdx: number) => void;
  dealTiles: () => void;
  reset: () => void;
  completeSelection: () => void;
  analyzeTenpai: () => void;
  discardTile: (tile: Tile) => Promise<void>;

  // 状態
  isAnalyzing: boolean;
  hasDealt: boolean;
  suggestions: TenpaiPattern[] | null;
}

export function GameBoard({
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
}: Props) {
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [activeZone, setActiveZone] = useState<"hand" | "pool" | null>(null);

  // 捨て牌履歴を6枚ずつ表示するヘルパー関数
  const renderDiscardHistory = (discards: Tile[]) => {
    const rows = [];
    for (let i = 0; i < discards.length; i += 6) {
      const rowTiles = discards.slice(i, i + 6);
      rows.push(
        <div key={i} className="flex gap-1 mb-1">
          {rowTiles.map((tile, index) => (
            <div key={tile.id} className="w-8 h-12">
              <MahjongTile
                tile={tile}
                selected={false}
                index={i + index}
                priority={false}
              />
            </div>
          ))}
        </div>
      );
    }
    return rows;
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

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto p-4">
        <GameHeader
          onDeal={dealTiles}
          onReset={reset}
          onAnalyze={analyzeTenpai}
          isAnalyzing={isAnalyzing}
          hasDealt={hasDealt}
        />
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          {gamePhase === 'selecting' && (
            <>
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold">手牌選択（13枚を選んでください）</h2>
                  <button
                    onClick={completeSelection}
                    disabled={handTiles.length !== 13}
                    className={`px-4 py-2 rounded ${handTiles.length === 13
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500'
                      }`}
                  >
                    選択完了 ({handTiles.length}/13枚)
                  </button>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <HandZone
                    tiles={handTiles}
                    onTileDrop={moveTile}
                    onReorder={(fromIdx, toIdx) => reorderZone('hand', fromIdx, toIdx)}
                  />
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold">配牌</h2>
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
              <div className={`p-4 rounded-lg text-center font-semibold ${isProcessingWin ? 'bg-yellow-100 text-yellow-800' :
                isPlayerTurn ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                {isProcessingWin ? '和了判定中...' :
                  isPlayerTurn ? 'あなたの番です' : 'CPUの番です'}
              </div>

              {/* CPU手牌 */}
              <section>
                <h2 className="mb-2 font-semibold">CPU手牌</h2>
                <div className="flex gap-1 bg-gray-100 p-4 rounded-lg">
                  {Array.from({ length: 13 }, (_, i) => (
                    <div
                      key={i}
                      className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 bg-gray-300 rounded border"
                    />
                  ))}
                </div>
              </section>

              {/* 捨て牌履歴 */}
              <div className="grid grid-cols-2 gap-4">
                <section>
                  <h2 className="mb-2 font-semibold">あなたの捨て牌</h2>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-20">
                    {playerDiscards.length === 0 ? (
                      <div className="text-gray-400 text-center">まだ捨て牌がありません</div>
                    ) : (
                      renderDiscardHistory(playerDiscards)
                    )}
                  </div>
                </section>
                <section>
                  <h2 className="mb-2 font-semibold">CPUの捨て牌</h2>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-20">
                    {cpuDiscards.length === 0 ? (
                      <div className="text-gray-400 text-center">まだ捨て牌がありません</div>
                    ) : (
                      renderDiscardHistory(cpuDiscards)
                    )}
                  </div>
                </section>
              </div>

              {/* プレイヤーの手牌 */}
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold">あなたの手牌</h2>
                  <DoraIndicator dora={dora} />
                </div>
                <div className="flex gap-2 bg-blue-50 p-4 rounded-lg">
                  {handTiles.map((tile, index) => (
                    <MahjongTile
                      key={tile.id}
                      tile={tile}
                      selected
                      index={index}
                      priority={true}
                    />
                  ))}
                </div>
              </section>

              {/* 選択可能な捨て牌 */}
              <section>
                <h2 className="mb-2 font-semibold">
                  捨て牌を選択してください（{poolTiles.length}枚）
                  {isProcessingWin ? <span className="text-yellow-500 ml-2">（和了判定中...）</span> :
                    !isPlayerTurn && <span className="text-gray-500 ml-2">（CPUの番です）</span>}
                </h2>
                <div className="flex flex-wrap gap-2 bg-yellow-50 p-4 rounded-lg">
                  {poolTiles.map((tile, index) => (
                    <div
                      key={tile.id}
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
            <section className="mt-4">
              <div className={`p-6 rounded-lg text-center ${winningInfo.winner === 'player'
                ? 'bg-blue-100 border-2 border-blue-300'
                : 'bg-red-100 border-2 border-red-300'
                }`}>
                <h2 className="text-3xl font-bold mb-4">
                  {winningInfo.winner === 'player' ? '🎉 あなたの和了！' : '😔 CPUの和了'}
                </h2>

                <div className="mb-4">
                  <div className="text-xl font-semibold mb-2">
                    {winningInfo.han && winningInfo.fu ?
                      `${winningInfo.han}飜 ${winningInfo.fu}符 ${winningInfo.points}点` :
                      `${winningInfo.points}点の和了`
                    }
                  </div>

                  <div className="mb-3">
                    <span className="font-semibold">和了牌：</span>
                    <div className="inline-flex w-12 h-16 mx-2">
                      <div className="relative w-full h-full">
                        <Image
                          src={getTileImagePath(winningInfo.winningTile)}
                          alt={winningInfo.winningTile}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="font-semibold mb-2">成立した役：</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {winningInfo.yaku.map((yaku, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white rounded-full text-sm font-medium border"
                        >
                          {yaku}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  新しいゲームを始める
                </button>
              </div>
            </section>
          )}

          {/* 流局表示 */}
          {gamePhase === 'finished' && !winningInfo && (
            <section className="mt-4">
              <div className="p-6 rounded-lg text-center bg-gray-100">
                <h2 className="text-2xl font-bold mb-4">流局</h2>
                <div className="text-lg mb-4">
                  <div className="mb-2">プレイヤー：{playerDiscards.length}枚捨て牌</div>
                  <div className="mb-2">CPU：{cpuDiscards.length}枚捨て牌</div>
                </div>
                <button
                  onClick={reset}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  新しいゲームを始める
                </button>
              </div>
            </section>
          )}

          {suggestions && suggestions.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold mb-4">聴牌形提案</h2>
              <div className="space-y-6">
                {suggestions.map((pattern, patternIndex) => (
                  <div key={patternIndex} className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-semibold mb-2">提案 {patternIndex + 1}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">手牌</p>
                        <div className="flex flex-wrap gap-2">
                          {pattern.tiles.map((tile, index) => (
                            <div key={index} className="inline-flex w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20">
                              <div className="relative w-full h-full flex items-center justify-center">
                                <div className="relative w-[85%] h-[85%]">
                                  <Image
                                    src={getTileImagePath(tile)}
                                    alt={tile}
                                    fill
                                    sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 56px"
                                    className="object-contain"
                                    priority={false}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">待ち牌と成立する役</p>
                        <div className="space-y-2">
                          {pattern.waitingTiles.map((wait, waitIndex) => (
                            <div key={waitIndex} className="flex items-start gap-2">
                              <div className="inline-flex w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20">
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <div className="relative w-[85%] h-[85%]">
                                    <Image
                                      src={getTileImagePath(wait.tile)}
                                      alt={wait.tile}
                                      fill
                                      sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 56px"
                                      className="object-contain"
                                      priority={false}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {wait.yaku.map((yaku, yakuIndex) => (
                                  <span key={yakuIndex} className="bg-green-100 px-2 py-1 rounded text-sm">
                                    {yaku}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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