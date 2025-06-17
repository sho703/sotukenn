import React from "react";
import MahjongTile from "./MahjongTile";
import { Tile } from "../hooks/useMahjongDeal";

type Props = {
  tiles: Tile[];
  onTileDrop: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  onReorder: (zone: "hand" | "pool", fromIdx: number, toIdx: number) => void;
};

const MahjongGrid: React.FC<Props> = ({ tiles, onTileDrop, onReorder }) => {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIdx?: number) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData("tileId");
    const fromZone = e.dataTransfer.getData("fromZone") as "hand" | "pool";
    if (!tileId) return;
    if (fromZone === "pool" && typeof dropIdx === "number") {
      // 配牌ゾーン内並び替え
      const fromIdx = tiles.findIndex((t) => t.id === tileId);
      if (fromIdx !== -1 && fromIdx !== dropIdx) onReorder("pool", fromIdx, dropIdx);
    } else if (fromZone === "hand") {
      // 手牌→配牌
      onTileDrop(tileId, "hand", "pool", dropIdx);
    }
  };

  return (
    <div
      className="grid grid-cols-8 gap-2 p-4 bg-gray-100 rounded"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e)}
    >
      {tiles.map((tile, idx) => (
        <div
          key={tile.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("tileId", tile.id);
            e.dataTransfer.setData("fromZone", "pool");
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, idx)}
        >
          <MahjongTile tile={tile} />
        </div>
      ))}
    </div>
  );
};

export default MahjongGrid;