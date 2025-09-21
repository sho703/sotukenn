export interface Tile {
  id: string;
  type: string;
  imagePath: string;
}

export interface DragEndEvent {
  active: { id: string };
  over: { id: string } | null;
}

export interface Zone {
  id: string;
  tiles: Tile[];
} 