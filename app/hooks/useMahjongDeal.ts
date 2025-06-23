"use client";

import { useState, useEffect } from "react";
import { dealMahjong } from "@/lib/mahjong";

// ユニークID生成ヘルパー（簡単なインクリメント、uuidでもOK）
let tileIdCounter = 0;
function nextTileId() {
  return `tile-${tileIdCounter++}`;
}

export type Tile = { id: string; type: string };

function convertToTiles(tileTypes: string[]): Tile[] {
  // 文字列配列 → ユニークID付きTile配列
  return tileTypes.map((type) => ({ id: nextTileId(), type }));
}

export function useMahjongDeal() {
  const [deal, setDeal] = useState<{ player1: Tile[]; dora: Tile } | null>(null);
  const [handTiles, setHandTiles] = useState<Tile[]>([]);
  const [poolTiles, setPoolTiles] = useState<Tile[]>([]);

  // 初回のみ牌配列をユニークID付きで生成
  useEffect(() => {
    const raw = dealMahjong(); // ここでは { player1: string[], dora: string } 型を仮定
    console.log('Dealt tiles:', raw); // デバッグログ
    const playerTiles = convertToTiles(raw.player1);
    console.log('Converted player tiles:', playerTiles); // デバッグログ
    const doraTile = { id: nextTileId(), type: raw.dora };
    setDeal({ player1: playerTiles, dora: doraTile });
    setHandTiles([]);
    setPoolTiles(playerTiles);
  }, []);

  // 手牌ゾーンにある牌をすべて配牌ゾーンに戻す
  const reset = () => {
    if (!deal) return;
    setPoolTiles([...poolTiles, ...handTiles]);
    setHandTiles([]);
  };

  // ゾーン間移動
  const moveTile = (
    tileId: string,
    fromZone: "hand" | "pool",
    toZone: "hand" | "pool",
    atIdx?: number
  ) => {
    if (!deal) return;
    if (fromZone === toZone) return;
    let fromArr = fromZone === "hand" ? handTiles : poolTiles;
    let toArr = toZone === "hand" ? handTiles : poolTiles;
    const movingTile = fromArr.find((t) => t.id === tileId);
    if (!movingTile) return;
    if (toZone === "hand" && handTiles.length >= 13) return;

    // Remove from current zone
    fromArr = fromArr.filter((t) => t.id !== tileId);

    // Insert into new zone
    if (typeof atIdx === "number") {
      toArr = [
        ...toArr.slice(0, atIdx),
        movingTile,
        ...toArr.slice(atIdx)
      ];
    } else {
      toArr = [...toArr, movingTile];
    }
    if (fromZone === "hand") setHandTiles(fromArr), setPoolTiles(toArr);
    else setPoolTiles(fromArr), setHandTiles(toArr);
  };

  // ゾーン内並び替え
  const reorderZone = (
    zone: "hand" | "pool",
    fromIdx: number,
    toIdx: number
  ) => {
    if (!deal) return;
    const arr = zone === "hand" ? [...handTiles] : [...poolTiles];
    const [removed] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, removed);
    if (zone === "hand") setHandTiles(arr);
    else setPoolTiles(arr);
  };

  const result = {
    handTiles: handTiles || [],
    poolTiles: poolTiles || [],
    dora: deal?.dora?.type ?? "",
    doraTile: deal?.dora,
    reset,
    moveTile,
    reorderZone,
  };

  console.log('Hook result:', result); // デバッグログ
  return result;
}