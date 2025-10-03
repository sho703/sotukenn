'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
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
  const { setNodeRef } = useDroppable({
    id: 'hand',
  });

  return (
    <div
      ref={setNodeRef}
      className="min-h-24 flex flex-wrap justify-center gap-2 p-6 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50/80"
      style={{ touchAction: 'none' }}
    >
      {tiles.length === 0 && <div className="text-gray-400 text-lg font-semibold">ここに13枚ドラッグ</div>}
      <SortableContext
        id="hand"
        items={tiles.map(t => t.id)}
        strategy={horizontalListSortingStrategy}
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