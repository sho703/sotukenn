import React from "react";
import MahjongTile from "./MahjongTile";

type Props = {
  tiles: string[];
  onTileDrop?: (tile: string) => void;
  onTileDragStart?: (e: React.DragEvent<HTMLDivElement>, tile: string) => void;
  onTileRemove?: (tile: string) => void;
  onReorder?: (nextTiles: string[]) => void;
};

// ドロップ対応（ドラッグ&ドロップAPI簡易対応版）
const HandZone: React.FC<Props> = ({
  tiles,
  onTileDrop,
  onTileDragStart,
  onTileRemove,
}) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const tile = e.dataTransfer.getData("text/plain");
    if (onTileDrop && tile) onTileDrop(tile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className="min-h-14 flex flex-wrap gap-2 p-4 border-2 border-dashed border-blue-400 rounded bg-blue-50"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {tiles.length === 0 && (
        <div className="text-gray-400">ここに13枚ドラッグ</div>
      )}
      {tiles.map((tile, idx) => (
        <MahjongTile
          key={`${tile}-${idx}`}
          tile={tile}
          draggable={!!onTileDragStart}
          onDragStart={onTileDragStart}
          onClick={onTileRemove ? () => onTileRemove(tile) : undefined}
          selected
        />
      ))}
    </div>
  );
};

export default HandZone;