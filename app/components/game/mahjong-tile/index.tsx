'use client';

import { cn } from "@/lib/utils";
import { Tile } from "../types";
import Image from "next/image";
import { useState } from "react";

interface Props {
  tile: Tile;
  selected?: boolean;
  priority?: boolean;
  isDora?: boolean;
}

export function MahjongTile({ tile, selected, priority = false, isDora = false }: Props) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={{
        touchAction: 'none'
      }}
    >
      <div className="relative">
        <div
          className={cn(
            "inline-flex select-none relative",
            "w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22",
            selected ? "bg-blue-50" : "bg-transparent",
            isDora && "border-4 border-yellow-400 rounded-lg shadow-[0_0_20px_rgba(250,204,21,0.8)]"
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
    </div>
  );
} 