'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { MahjongTile } from '../mahjong-tile';
import { Tile } from '../types';

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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MahjongTile
        tile={tile}
        selected={false}
        index={index}
        priority={false}
      />
    </div>
  );
}

export function MahjongGrid({ tiles = [], onTileDrop, onReorder }: Props) {
  const { setNodeRef } = useDroppable({
    id: 'pool',
  });

  return (
    <div
      ref={setNodeRef}
      className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2 p-4 bg-gray-100 rounded"
    >
      <SortableContext
        id="pool"
        items={tiles.map(t => t.id)}
        strategy={rectSortingStrategy}
      >
        {tiles.map((tile, index) => (
          <SortableMahjongTile
            key={tile.id}
            tile={tile}
            index={index}
          />
        ))}
      </SortableContext>
    </div>
  );
} 