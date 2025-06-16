import React from "react";

type Props = {
  tile: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, tile: string) => void;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
};

export const MahjongTile: React.FC<Props> = ({
  tile,
  draggable = false,
  onDragStart,
  onClick,
  selected = false,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center border rounded-sm px-2 py-1 cursor-pointer select-none transition
        ${selected ? "bg-blue-100 border-blue-500 text-black" : "bg-white border-gray-300 text-black"}
        ${className}
      `}
      draggable={draggable}
      onDragStart={draggable && onDragStart ? (e) => onDragStart(e, tile) : undefined}
      onClick={onClick}
      aria-selected={selected}
      tabIndex={0}
    >
      {tile}
    </div>
  );
};

export default MahjongTile;