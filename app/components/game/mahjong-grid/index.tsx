'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { MahjongTile } from '../mahjong-tile';
import { Tile } from '../types';

interface Props {
  tiles: Tile[];
  onTileDrop: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  onReorder: (zone: "hand" | "pool", fromIdx: number, toIdx: number) => void;
}

export function MahjongGrid({ tiles = [], onTileDrop, onReorder }: Props) {
  const { setNodeRef } = useDroppable({
    id: 'pool',
  });

  return (
    <div
      ref={setNodeRef}
      className="grid grid-cols-8 gap-2 p-4 bg-gray-100 rounded"
    >
      <SortableContext
        id="pool"
        items={tiles.map(t => t.id)}
        strategy={rectSortingStrategy}
      >
        {tiles.map((tile, index) => (
          <MahjongTile
            key={tile.id}
            tile={tile}
            index={index}
          />
        ))}
      </SortableContext>
    </div>
  );
} 