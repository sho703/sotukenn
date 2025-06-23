// 麻雀牌を文字列型で表現 & シャッフル・配布・ドラ決定

import { TileType } from "@/types";

// 牌の種類（萬子、筒子、索子、字牌）
const suits = ['m', 'p', 's'] as const;
const honors = ['東', '南', '西', '北', '白', '発', '中'] as const;

// 牌一覧（全136枚）
export function generateTiles(): TileType[] {
  const tiles: TileType[] = [];

  // 萬子, 筒子, 索子（1-9 各4枚）
  for (const suit of suits) {
    for (let num = 1; num <= 9; num++) {
      for (let i = 0; i < 4; i++) {
        tiles.push(`${num}${suit}` as TileType);
      }
    }
  }
  // 字牌（各4枚）
  for (const honor of honors) {
    for (let i = 0; i < 4; i++) {
      tiles.push(honor);
    }
  }
  return tiles;
}

// Fisher-Yatesシャッフル
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 牌を配る・ドラ表示を決定
export function dealMahjong(): {
  player1: TileType[];
  dora: TileType;
} {
  // 牌生成→シャッフル
  const tiles = shuffle(generateTiles());

  // 34枚を配る
  const player1 = tiles.slice(0, 34);

  // 1枚をドラ表示
  const dora = tiles[34];

  return { player1, dora };
}