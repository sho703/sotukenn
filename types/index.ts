// 麻雀牌の種類を表す型
export type TileType = `${number}${'m' | 'p' | 's'}` | '東' | '南' | '西' | '北' | '白' | '発' | '中';

// 麻雀牌を表す型
export interface Tile {
  id: string;
  type: TileType;
}

// ゾーンの種類を表す型
export type Zone = 'hand' | 'pool';

// 麻雀の配牌状態を表す型
export interface MahjongDealState {
  handTiles: Tile[];
  poolTiles: Tile[];
  dora: TileType;
  doraTile: Tile | null;
}

// 麻雀の操作を表す型
export interface MahjongActions {
  reset: () => void;
  moveTile: (tileId: string, fromZone: Zone, toZone: Zone, atIdx?: number) => void;
  reorderZone: (zone: Zone, fromIdx: number, toIdx: number) => void;
}

// useMahjongDealフックの戻り値の型
export type MahjongDealHook = MahjongDealState & MahjongActions; 