import React from "react";
import { Tile } from "../hooks/useMahjongDeal";

type Props = {
  tile: Tile;
  selected?: boolean;
};

const MahjongTile: React.FC<Props> = ({ tile, selected }) => (
  <span
    className={`inline-flex items-center justify-center border rounded-sm px-2 py-1 cursor-pointer select-none transition
        ${selected ? "bg-blue-100 border-blue-500 text-black" : "bg-white border-gray-300 text-black"}
      `}
  >
    {tile.type}
  </span>
);

export default MahjongTile;