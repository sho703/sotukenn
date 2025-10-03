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
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'none'
      }}
      {...attributes}
      {...listeners}
    >
      <div
        className={cn(
          "inline-flex cursor-grab active:cursor-grabbing select-none",
          "w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22",
          selected ? "bg-blue-50" : "bg-transparent"
        )}
        style={{ touchAction: 'none' }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative w-full h-full">
            {!imageError ? (
              <Image
                src={tile.imagePath}
                alt={tile.type}
                fill
                sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
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