import React from "react";
import MahjongTile from "./MahjongTile";
import { Tile } from "../hooks/useMahjongDeal";

type Props = {
  tiles: Tile[];
  onTileDrop: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  onReorder: (zone: "hand" | "pool", fromIdx: number, toIdx: number) => void;
};

const HandZone: React.FC<Props> = ({ tiles, onTileDrop, onReorder }) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIdx?: number) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData("tileId");
    const fromZone = e.dataTransfer.getData("fromZone") as "hand" | "pool";
    if (!tileId) return;
    if (fromZone === "hand" && typeof dropIdx === "number") {
      // 並び替え
      const fromIdx = tiles.findIndex((t) => t.id === tileId);
      if (fromIdx !== -1 && fromIdx !== dropIdx) onReorder("hand", fromIdx, dropIdx);
    } else if (fromZone === "pool") {
      onTileDrop(tileId, "pool", "hand", dropIdx);
    }
  };

  return (
    <div
      className="min-h-14 flex flex-wrap gap-2 p-4 border-2 border-dashed border-blue-400 rounded bg-blue-50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e)}
    >
      {tiles.length === 0 && <div className="text-gray-400">ここに13枚ドラッグ</div>}
      {tiles.map((tile, idx) => (
        <div
          key={tile.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("tileId", tile.id);
            e.dataTransfer.setData("fromZone", "hand");
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, idx)}
        >
          <MahjongTile tile={tile} selected />
        </div>
      ))}
    </div>
  );
};

export default HandZone;