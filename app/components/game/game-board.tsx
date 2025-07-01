'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState } from 'react';
import { HandZone } from './hand-zone';
import { MahjongGrid } from './mahjong-grid';
import { MahjongTile } from './mahjong-tile';
import { DoraIndicator } from './dora-indicator';
import { Tile } from './types';
import { TenpaiPattern } from '@/types';
import { GameHeader } from './game-header';
import Image from 'next/image';
import { getTileImagePath } from '@/lib/mahjong';

interface Props {
  handTiles: Tile[];
  poolTiles: Tile[];
  dora: string;
  moveTile: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  reorderZone: (zone: "hand" | "pool", fromIdx: number, toIdx: number) => void;
  dealTiles: () => void;
  reset: () => void;
  analyzeTenpai: () => void;
  isAnalyzing: boolean;
  hasDealt: boolean;
  error: string | null;
  suggestions: TenpaiPattern[] | null;
}

export function GameBoard({
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
}: Props) {
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [activeZone, setActiveZone] = useState<"hand" | "pool" | null>(null);

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

          <section>
            <h2 className="mb-2 font-semibold">手牌ゾーン（13枚まで）</h2>
            <div className="max-w-full overflow-x-auto">
              <HandZone
                tiles={handTiles}
                onTileDrop={moveTile}
                onReorder={reorderZone}
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
                onReorder={reorderZone}
              />
            </div>
          </section>

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