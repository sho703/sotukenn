'use client';

import { useDroppable } from '@dnd-kit/core';
import { MahjongTile } from '../mahjong-tile';
import { Tile } from '../types';

interface Props {
  tiles: Tile[];
  onTileDrop: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  onReorder: (fromIdx: number, toIdx: number) => void;
}

export function HandZoneWithBlocks({ tiles = [] }: Props) {
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
      {tiles.map((tile, index) => (
        <MahjongTile
          key={`${tile.id}-${index}`}
          tile={tile}
          selected
          priority={true}
        />
      ))}
    </div>
  );
}