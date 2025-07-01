// 麻雀牌を文字列型で表現 & シャッフル・配布・ドラ決定

import { TileType } from "@/types";

// 牌の種類（萬子、筒子、索子、字牌）
const suits = ['m', 'p', 's'] as const;
const honors = ['東', '南', '西', '北', '白', '発', '中'] as const;

// 牌の画像パスを生成する関数
export function getTileImagePath(type: TileType): string {
  try {
    // 字牌の場合（1z-7zの形式）
    if (type.endsWith('z')) {
      const number = parseInt(type.charAt(0));
      const honorMap: Record<number, string> = {
        1: 'ton',   // 東
        2: 'nan',   // 南
        3: 'sha',   // 西
        4: 'pei',   // 北
        5: 'haku',  // 白
        6: 'hatsu', // 発
        7: 'chun'   // 中
      };
      if (!honorMap[number]) {
        console.error(`Invalid honor tile number: ${number}`);
        return '/images/tiles/back.gif'; // フォールバック画像
      }
      return `/images/tiles/${honorMap[number]}.gif`;
    }
    // 直接漢字で指定された字牌の場合
    else if (type.length === 1 || ['東', '南', '西', '北', '白', '発', '中'].includes(type)) {
      const honorMap: Record<string, string> = {
        '東': 'ton',
        '南': 'nan',
        '西': 'sha',
        '北': 'pei',
        '白': 'haku',
        '発': 'hatsu',
        '中': 'chun'
      };
      if (!honorMap[type]) {
        console.error(`Invalid honor tile type: ${type}`);
        return '/images/tiles/back.gif'; // フォールバック画像
      }
      return `/images/tiles/${honorMap[type]}.gif`;
    }
    // 数牌の場合
    else {
      const number = type.charAt(0);
      const suit = type.charAt(1);
      const suitMap: Record<string, string> = {
        'm': 'man',
        'p': 'pin',
        's': 'sou',
        't': 'pin'  // 'p'の代替表記として't'を追加
      };
      if (!suitMap[suit]) {
        console.error(`Invalid suit: ${suit} for tile type: ${type}`);
        return '/images/tiles/back.gif'; // フォールバック画像
      }
      return `/images/tiles/${number}${suitMap[suit]}.gif`;
    }
  } catch (error) {
    console.error(`Error processing tile type: ${type}`, error);
    return '/images/tiles/back.gif'; // フォールバック画像
  }
}

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