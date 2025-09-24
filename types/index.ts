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

// ゲームフェーズを表す型
export type GamePhase = 'title' | 'selecting' | 'playing' | 'finished' | 'draw';

// CPUの情報を表す型
export interface CpuState {
  handTiles: Tile[];      // 手牌（13枚）
  discardTiles: Tile[];   // 捨て牌候補（21枚、シャッフル済み）
  winningTile: Tile;      // 和了牌
}

// 和了情報を表す型
export interface WinningInfo {
  winner: 'player' | 'cpu';
  points: number;
  yaku: string[];
  winningTile: string;
  han?: number;
  fu?: number;
}

// スコア情報を表す型
export interface ScoreInfo {
  player: number;
  cpu: number;
}

// 麻雀の配牌状態を表す型
export interface MahjongDealState {
  handTiles: Tile[];      // プレイヤーの手牌（選択中/選択済みの13枚）
  poolTiles: Tile[];      // 選択可能な牌（配牌時34枚/対局時21枚）
  dora: TileType;
  doraTile: Tile | null;
  suggestions: TenpaiPattern[] | null;
  isAnalyzing: boolean;
  hasDealt: boolean;
  error: string | null;
  gamePhase: GamePhase;
  cpuState: CpuState | null;
  playerDiscards: Tile[]; // プレイヤーの捨て牌履歴
  cpuDiscards: Tile[];    // CPUの捨て牌履歴
  isPlayerTurn: boolean;  // プレイヤーの手番かどうか
  isProcessingWin: boolean; // 和了判定処理中かどうか
  winningInfo: WinningInfo | null; // 和了情報
  score: ScoreInfo; // スコア情報
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
  completeSelection: () => void;  // 手牌選択完了
  discardTile: (tile: Tile) => Promise<void>;  // 牌を捨てる
  startGame: () => void;  // ゲーム開始
  nextRound: () => void;  // 次の局へ
  endGame: () => void;  // ゲーム終了
  currentRound: number;  // 現在の局数
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