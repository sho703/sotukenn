import React from "react";
import MahjongTile from "./MahjongTile";

type Props = {
  tiles: string[];
  onTileDragStart?: (e: React.DragEvent<HTMLDivElement>, tile: string) => void;
  onTileClick?: (tile: string) => void;
};

const MahjongGrid: React.FC<Props> = ({ tiles, onTileDragStart, onTileClick }) => {
  return (
    <div className="grid grid-cols-6 gap-2 p-4 bg-gray-100 rounded">
      {tiles.map((tile, idx) => (
        <MahjongTile
          key={`${tile}-${idx}`}
          tile={tile}
          draggable={!!onTileDragStart}
          onDragStart={onTileDragStart}
          onClick={onTileClick ? () => onTileClick(tile) : undefined}
        />
      ))}
    </div>
  );
};

export default MahjongGrid;