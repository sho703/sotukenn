'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { MahjongTile } from '../mahjong-tile';
import { Tile } from '../types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Props {
  tiles: Tile[];
  onTileDrop: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
}

// ソート可能な麻雀牌コンポーネント
function SortableMahjongTile({ tile, index }: { tile: Tile; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: tile.id,
    data: {
      type: 'tile',
      index,
    }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'none'
      }}
      {...attributes}
      {...listeners}
    >
      <MahjongTile
        tile={tile}
        selected
        index={index}
        priority={true}
      />
    </div>
  );
}

export function HandZone({ tiles = [], onTileDrop, onReorder }: Props) {
  const [mode, setMode] = useState<'none' | 'normal' | 'seven-pairs'>('none');
  const { setNodeRef } = useDroppable({
    id: 'hand',
  });

  // 例示用の牌（薄く表示）
  const exampleTiles = {
    normal: [
      // 123m (順子)
      { id: 'ex1', type: 'man', imagePath: '/images/tiles/1man.gif' }, { id: 'ex2', type: 'man', imagePath: '/images/tiles/2man.gif' }, { id: 'ex3', type: 'man', imagePath: '/images/tiles/3man.gif' },
      // 456p (順子)
      { id: 'ex4', type: 'pin', imagePath: '/images/tiles/4pin.gif' }, { id: 'ex5', type: 'pin', imagePath: '/images/tiles/5pin.gif' }, { id: 'ex6', type: 'pin', imagePath: '/images/tiles/6pin.gif' },
      // 789s (順子)
      { id: 'ex7', type: 'sou', imagePath: '/images/tiles/9sou.gif' }, { id: 'ex8', type: 'sou', imagePath: '/images/tiles/9sou.gif' }, { id: 'ex9', type: 'sou', imagePath: '/images/tiles/9sou.gif' },
      // 45s (順子)
      { id: 'ex10', type: 'sou', imagePath: '/images/tiles/4sou.gif' }, { id: 'ex11', type: 'sou', imagePath: '/images/tiles/5sou.gif' },
      // 南南 (雀頭)
      { id: 'ex12', type: 'jihai', imagePath: '/images/tiles/nan.gif' }, { id: 'ex13', type: 'jihai', imagePath: '/images/tiles/nan.gif' }
    ],
    'seven-pairs': [
      // 11m
      { id: 'ex1', type: 'man', imagePath: '/images/tiles/1man.gif' }, { id: 'ex2', type: 'man', imagePath: '/images/tiles/1man.gif' },
      // 33p
      { id: 'ex3', type: 'pin', imagePath: '/images/tiles/3pin.gif' }, { id: 'ex4', type: 'pin', imagePath: '/images/tiles/3pin.gif' },
      // 55s
      { id: 'ex5', type: 'sou', imagePath: '/images/tiles/5sou.gif' }, { id: 'ex6', type: 'sou', imagePath: '/images/tiles/5sou.gif' },
      // 66s
      { id: 'ex7', type: 'sou', imagePath: '/images/tiles/6sou.gif' }, { id: 'ex8', type: 'sou', imagePath: '/images/tiles/6sou.gif' },
      // 東東
      { id: 'ex9', type: 'jihai', imagePath: '/images/tiles/ton.gif' }, { id: 'ex10', type: 'jihai', imagePath: '/images/tiles/ton.gif' },
      // 北北
      { id: 'ex11', type: 'jihai', imagePath: '/images/tiles/pei.gif' }, { id: 'ex12', type: 'jihai', imagePath: '/images/tiles/pei.gif' },
      // 中 (単騎)
      { id: 'ex13', type: 'jihai', imagePath: '/images/tiles/chun.gif' }
    ]
  };

  const getBlockLayout = () => {
    if (mode === 'normal') {
      return [3, 3, 3, 2, 2]; // 3:3:3:2:2
    } else if (mode === 'seven-pairs') {
      return [2, 2, 2, 2, 2, 2, 1]; // 2:2:2:2:2:2:1
    }
    return [];
  };

  const renderGuideLines = () => {
    if (mode === 'none') return null;

    const layout = getBlockLayout();
    const exampleTilesForMode = mode === 'normal' ? exampleTiles.normal : exampleTiles['seven-pairs'];

    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex h-full">
          {layout.map((blockSize, blockIndex) => (
            <div
              key={blockIndex}
              className={`flex-1 border-r-2 border-white/50 ${blockIndex === layout.length - 1 ? 'border-r-0' : ''}`}
            >
              <div className="flex flex-wrap gap-1 justify-center items-center h-full p-2">
                {tiles.length === 0 && Array.from({ length: blockSize }).map((_, tileIndex) => {
                  // 正しいインデックスを計算
                  let tileIndexInArray = 0;
                  for (let i = 0; i < blockIndex; i++) {
                    tileIndexInArray += layout[i];
                  }
                  tileIndexInArray += tileIndex;

                  const exampleTile = exampleTilesForMode[tileIndexInArray] || exampleTilesForMode[0];
                  return (
                    <div key={tileIndex} className="opacity-20 w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22 flex items-center justify-center">
                      <img
                        src={exampleTile.imagePath}
                        alt={`例示 ${exampleTile.type}`}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* モード切り替えボタン */}
      <div className="flex justify-center gap-2">
        <Button
          onClick={() => setMode('none')}
          variant={mode === 'none' ? 'mahjong' : 'outline'}
          className={mode === 'none' ? '' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}
          size="sm"
        >
          なし
        </Button>
        <Button
          onClick={() => setMode('normal')}
          variant={mode === 'normal' ? 'mahjong' : 'outline'}
          className={mode === 'normal' ? '' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}
          size="sm"
        >
          アシスト
        </Button>
        <Button
          onClick={() => setMode('seven-pairs')}
          variant={mode === 'seven-pairs' ? 'mahjong' : 'outline'}
          className={mode === 'seven-pairs' ? '' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}
          size="sm"
        >
          七対子
        </Button>
      </div>

      {/* 手牌表示エリア */}
      <div
        ref={setNodeRef}
        className="relative min-h-24 flex flex-wrap justify-center gap-2 p-6 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50/80"
        style={{ touchAction: 'none' }}
      >
        {/* 補助線と例示牌 */}
        {renderGuideLines()}

        {/* 実際の牌 */}
        {tiles.length === 0 && <div className="text-gray-400 text-lg font-semibold relative z-10">ここに13枚ドラッグ</div>}
        <SortableContext
          id="hand"
          items={tiles.map(t => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          {mode === 'none' ? (
            // なしモード：通常の表示
            tiles.map((tile, index) => (
              <SortableMahjongTile
                key={tile.id}
                tile={tile}
                index={index}
              />
            ))
          ) : (
            // アシスト・七対子モード：ブロック内に配置
            <div className="flex h-full w-full">
              {getBlockLayout().map((blockSize, blockIndex) => {
                let tileIndex = 0;
                // 前のブロックの牌数を計算
                for (let i = 0; i < blockIndex; i++) {
                  tileIndex += getBlockLayout()[i];
                }

                return (
                  <div
                    key={blockIndex}
                    className={`flex-1 border-r-2 border-transparent ${blockIndex === getBlockLayout().length - 1 ? 'border-r-0' : ''}`}
                  >
                    <div className="flex flex-wrap gap-1 justify-center items-center h-full p-2">
                      {Array.from({ length: blockSize }).map((_, slotIndex) => {
                        const tile = tiles[tileIndex];
                        tileIndex++;

                        if (tile) {
                          return (
                            <div key={tile.id} className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22 flex items-center justify-center">
                              <SortableMahjongTile
                                tile={tile}
                                index={tileIndex - 1}
                              />
                            </div>
                          );
                        } else {
                          return (
                            <div key={`empty-${blockIndex}-${slotIndex}`} className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22" />
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}