// 麻雀牌の種類を表す型
export type TileType = string; // 例: "1m", "2p", "3s", "1z"

// 麻雀牌を表す型
export interface Tile {
  id: string;
  type: TileType;
  imagePath: string;  // 牌の画像パスを追加
}

// ゾーンの種類を表す型
export type Zone = 'hand' | 'pool';

// 麻雀の配牌状態を表す型
export interface MahjongDealState {
  handTiles: Tile[];
  poolTiles: Tile[];
  dora: TileType;
  doraTile: Tile | null;
  suggestions: TenpaiPattern[] | null;
  isAnalyzing: boolean;
  hasDealt: boolean;
  error: string | null;
}

// 麻雀の操作を表す型
export interface MahjongActions {
  reset: () => void;
  moveTile: (tileId: string, fromZone: Zone, toZone: Zone, atIdx?: number) => void;
  reorderZone: (zone: Zone, fromIdx: number, toIdx: number) => void;
  analyzeTenpai: () => Promise<void>;
}

// useMahjongDealフックの戻り値の型
export interface MahjongDealHook extends MahjongDealState {
  reset: () => void;
  moveTile: (tileId: string, fromZone: Zone, toZone: Zone, atIdx?: number) => void;
  reorderZone: (zone: Zone, fromIdx: number, toIdx: number) => void;
  analyzeTenpai: () => Promise<void>;
  dealTiles: () => void;
}

// Tenpai Analysis Types
export interface WaitingTile {
  tile: TileType;
  yaku: string[];
}

export interface TenpaiPattern {
  tiles: TileType[];
  waitingTiles: WaitingTile[];
}

export interface TenpaiSuggestionResponse {
  patterns: TenpaiPattern[];
}

export interface TenpaiSuggestionRequest {
  tiles: TileType[];
  handTiles: TileType[];
} 