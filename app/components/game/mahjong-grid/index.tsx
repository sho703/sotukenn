'use client';

import { MahjongTile } from '../mahjong-tile';
import { Tile } from '../types';

interface Props {
  tiles: Tile[];
  onTileClick: (tileId: string) => void;
  dora?: string;
  isTileDisabled?: (tile: Tile) => boolean;
}

// クリック可能な麻雀牌コンポーネント
function ClickableMahjongTile({
  tile,
  isDora,
  onTileClick,
  disabled
}: {
  tile: Tile;
  isDora: boolean;
  onTileClick: (tileId: string) => void;
  disabled?: boolean;
}) {
  return (
    <div
      onClick={() => !disabled && onTileClick(tile.id)}
      className={`${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-105'} transition-transform`}
    >
      <MahjongTile
        tile={tile}
        selected={false}
        priority={false}
        isDora={isDora}
      />
    </div>
  );
}

export function MahjongGrid({ tiles = [], onTileClick, dora, isTileDisabled }: Props) {
  return (
    <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-11 lg:grid-cols-13 xl:grid-cols-15 2xl:grid-cols-17 gap-2 p-6 bg-transparent rounded max-w-7xl mx-auto">
      {tiles.map((tile) => (
        <ClickableMahjongTile
          key={tile.id}
          tile={tile}
          isDora={tile.type === dora}
          onTileClick={onTileClick}
          disabled={isTileDisabled ? isTileDisabled(tile) : false}
        />
      ))}
    </div>
  );
}