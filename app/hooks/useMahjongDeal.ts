"use client";

import { useState } from "react";
import { dealMahjong, getTileImagePath } from "@/lib/mahjong";
import { Tile, TileType, Zone, MahjongDealHook, TenpaiPattern } from "@/types";

// ユニークID生成ヘルパー（簡単なインクリメント、uuidでもOK）
let tileIdCounter = 0;
function nextTileId(): string {
  return `tile-${tileIdCounter++}`;
}

function convertToTiles(tileTypes: TileType[]): Tile[] {
  return tileTypes.map((type) => ({
    id: nextTileId(),
    type,
    imagePath: getTileImagePath(type)
  }));
}

// 牌を種類でソート
function sortTiles(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    const typeA = a.type;
    const typeB = b.type;

    // 字牌の場合は特別な処理
    const isHonorA = typeA.length === 1;
    const isHonorB = typeB.length === 1;

    if (isHonorA && isHonorB) {
      // 両方字牌の場合：東南西北白發中の順
      const honorOrder = '東南西北白發中';
      return honorOrder.indexOf(typeA) - honorOrder.indexOf(typeB);
    }

    if (isHonorA) return 1;  // 字牌は後ろに
    if (isHonorB) return -1; // 字牌は後ろに

    // 数牌の場合
    const suitA = typeA.charAt(1);
    const suitB = typeB.charAt(1);
    const numA = parseInt(typeA.charAt(0));
    const numB = parseInt(typeB.charAt(0));

    // まず種類で比較（萬子 > 筒子 > 索子）
    const suitOrder = 'mps';
    const suitCompare = suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB);
    if (suitCompare !== 0) return suitCompare;

    // 同じ種類なら数字で比較
    return numA - numB;
  });
}

export function useMahjongDeal(): MahjongDealHook {
  const [deal, setDeal] = useState<{ player1: Tile[]; dora: Tile } | null>(null);
  const [handTiles, setHandTiles] = useState<Tile[]>([]);
  const [poolTiles, setPoolTiles] = useState<Tile[]>([]);
  const [suggestions, setSuggestions] = useState<TenpaiPattern[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 牌を配布する関数
  const dealTiles = () => {
    setError(null);
    const raw = dealMahjong();
    const playerTiles = convertToTiles(raw.player1 as TileType[]);
    const doraTile = {
      id: nextTileId(),
      type: raw.dora as TileType,
      imagePath: getTileImagePath(raw.dora as TileType)
    };
    setDeal({ player1: playerTiles, dora: doraTile });
    setHandTiles([]);
    setPoolTiles(sortTiles(playerTiles));
    setSuggestions(null);
  };

  // 手牌ゾーンにある牌をすべて配牌ゾーンに戻す
  const reset = () => {
    if (!deal) return;
    setError(null);
    const allTiles = [...poolTiles, ...handTiles];
    setPoolTiles(sortTiles(allTiles));
    setHandTiles([]);
    setSuggestions(null);
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
    if (fromZone === "hand") {
      setHandTiles(fromArr);
      setPoolTiles(toZone === "pool" ? sortTiles(toArr) : toArr);
    } else {
      setPoolTiles(sortTiles(fromArr));
      setHandTiles(toArr);
    }
    setSuggestions(null);
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
    if (zone === "hand") {
      setHandTiles(arr);
    } else {
      setPoolTiles(sortTiles(arr));
    }
  };

  const analyzeTenpai = async () => {
    if (!deal) return;
    setError(null);
    setIsAnalyzing(true);
    setSuggestions(null);

    try {
      const allTiles = [...poolTiles];

      const response = await fetch('/api/suggest-tenpai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiles: allTiles.map(t => t.type),
          handTiles: handTiles.map(t => t.type)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze tenpai');
      }

      const data = await response.json();
      setSuggestions(data.patterns);
    } catch (error) {
      setError(error instanceof Error ? error.message : '分析中にエラーが発生しました');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    handTiles: handTiles || [],
    poolTiles: poolTiles || [],
    dora: deal?.dora?.type ?? "1m",
    doraTile: deal?.dora ?? null,
    hasDealt: deal !== null,
    error,
    reset,
    moveTile,
    reorderZone,
    suggestions,
    isAnalyzing,
    analyzeTenpai,
    dealTiles,
  };
}