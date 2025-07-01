'use client';

import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tile } from "../types";
import Image from "next/image";
import { useState } from "react";

interface Props {
  tile: Tile;
  selected?: boolean;
  index: number;
  priority?: boolean;
}

export function MahjongTile({ tile, selected, index, priority = false }: Props) {
  const [imageError, setImageError] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: tile.id,
    data: {
      index,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={cn(
          "inline-flex cursor-grab active:cursor-grabbing select-none",
          "w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20",
          selected ? "bg-blue-50" : "bg-transparent"
        )}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-[85%] h-[85%]">
            {!imageError ? (
              <Image
                src={tile.imagePath}
                alt={tile.type}
                fill
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 56px"
                className="object-contain"
                priority={priority}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs sm:text-sm">
                {tile.type}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 