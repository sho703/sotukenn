'use client';

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tile } from "../types";

interface Props {
  tile: Tile;
  selected?: boolean;
  index: number;
}

export function MahjongTile({ tile, selected, index }: Props) {
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
      <Card
        className={cn(
          "inline-flex cursor-grab active:cursor-grabbing select-none transition",
          selected ? "bg-blue-100 border-blue-500" : "bg-white hover:bg-gray-50"
        )}
      >
        <CardContent className="p-2 flex items-center justify-center">
          {tile.type}
        </CardContent>
      </Card>
    </div>
  );
} 