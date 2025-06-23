"use client";

import { useState, useEffect } from "react";
import { dealMahjong } from "@/lib/mahjong";
import { Tile, TileType, Zone, MahjongDealHook } from "@/types";

// ユニークID生成ヘルパー（簡単なインクリメント、uuidでもOK）
let tileIdCounter = 0;
function nextTileId(): string {
  return `tile-${tileIdCounter++}`;
}

function convertToTiles(tileTypes: TileType[]): Tile[] {
  return tileTypes.map((type) => ({ id: nextTileId(), type }));
}

export function useMahjongDeal(): MahjongDealHook {
  const [deal, setDeal] = useState<{ player1: Tile[]; dora: Tile } | null>(null);
  const [handTiles, setHandTiles] = useState<Tile[]>([]);
  const [poolTiles, setPoolTiles] = useState<Tile[]>([]);

  // 初回のみ牌配列をユニークID付きで生成
  useEffect(() => {
    const raw = dealMahjong();
    const playerTiles = convertToTiles(raw.player1 as TileType[]);
    const doraTile = { id: nextTileId(), type: raw.dora as TileType };
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
    fromZone: Zone,
    toZone: Zone,
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
    zone: Zone,
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

  return {
    handTiles: handTiles || [],
    poolTiles: poolTiles || [],
    dora: deal?.dora?.type ?? "",
    doraTile: deal?.dora ?? null,
    reset,
    moveTile,
    reorderZone,
  };
}