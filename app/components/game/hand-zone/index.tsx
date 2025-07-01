'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { MahjongTile } from '../mahjong-tile';
import { Tile } from '../types';

interface Props {
  tiles: Tile[];
  onTileDrop: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  onReorder: (zone: "hand" | "pool", fromIdx: number, toIdx: number) => void;
}

export function HandZone({ tiles = [], onTileDrop, onReorder }: Props) {
  const { setNodeRef } = useDroppable({
    id: 'hand',
  });

  return (
    <div
      ref={setNodeRef}
      className="min-h-14 flex flex-wrap gap-2 p-4 border-2 border-dashed border-blue-400 rounded bg-blue-50"
    >
      {tiles.length === 0 && <div className="text-gray-400">ここに13枚ドラッグ</div>}
      <SortableContext
        id="hand"
        items={tiles.map(t => t.id)}
        strategy={horizontalListSortingStrategy}
      >
        {tiles.map((tile, index) => (
          <MahjongTile
            key={tile.id}
            tile={tile}
            selected
            index={index}
            priority={true}
          />
        ))}
      </SortableContext>
    </div>
  );
} 