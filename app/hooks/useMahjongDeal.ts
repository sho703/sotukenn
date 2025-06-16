"use client";


import { useState } from "react";
import { dealMahjong } from "@/lib/mahjong";

// 状態管理カスタムフック
export function useMahjongDeal() {
  // 初期化：配牌・ドラ生成
  const [deal, setDeal] = useState(() => dealMahjong());

  // 牌の移動管理
  const [handTiles, setHandTiles] = useState<string[]>([]); // 13枚まで
  const [poolTiles, setPoolTiles] = useState<string[]>(deal.player1); // 残りの配牌

  // ドラ再セット
  const reset = () => {
    const next = dealMahjong();
    setDeal(next);
    setHandTiles([]);
    setPoolTiles(next.player1);
  };

  // プール→手牌へ移動
  const moveToHand = (tile: string) => {
    if (handTiles.length >= 13) return;
    if (!poolTiles.includes(tile)) return;
    setHandTiles([...handTiles, tile]);
    setPoolTiles(poolTiles.filter((t) => t !== tile));
  };

  // 手牌→プールへ戻す
  const moveToPool = (tile: string) => {
    if (!handTiles.includes(tile)) return;
    setHandTiles(handTiles.filter((t) => t !== tile));
    setPoolTiles([...poolTiles, tile]);
  };

  // 並び替え（HandZoneで利用）
  const reorderHand = (nextHand: string[]) => setHandTiles(nextHand);

  return {
    // 状態
    handTiles,
    poolTiles,
    dora: deal.dora,
    reset,
    moveToHand,
    moveToPool,
    reorderHand,
  };
}