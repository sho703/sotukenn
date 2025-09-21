"use client";

import { useState } from "react";
import { dealMahjong, getTileImagePath, shuffle, sortTiles } from "@/app/lib/mahjong";
import {
  Tile,
  TileType,
  Zone,
  MahjongDealHook,
  TenpaiPattern,
  GamePhase,
  CpuState,
  WinningInfo
} from "@/types";

// ユニークID生成ヘルパー（簡単なインクリメント、uuidでもOK）
let tileIdCounter = 0;
function nextTileId(): string {
  return `tile-${tileIdCounter++}`;
}

// CPUの手牌と捨て牌を設定する関数
function setupCpuTiles(tiles: Tile[]): CpuState {
  // ランダムに13枚を選択して手牌に
  const shuffled = shuffle([...tiles]);
  const handTiles = shuffled.slice(0, 13);

  // 残りの21枚をシャッフルして捨て牌候補に
  const discardTiles = shuffle(shuffled.slice(13));

  // ランダムな和了牌を設定（捨て牌候補から1枚）
  const winningTile = discardTiles[Math.floor(Math.random() * discardTiles.length)];

  return {
    handTiles,
    discardTiles,
    winningTile
  };
}

// CPUの自動応答を処理する関数
function handleCpuResponse(discardedTile: Tile): { isWin: boolean; points: number | null } {
  // ランダムに和了判定（20%の確率で和了）
  const isWin = Math.random() < 0.2;
  return { isWin, points: isWin ? Math.floor(Math.random() * 5) + 1 : null };
}

function convertToTiles(tileTypes: TileType[]): Tile[] {
  return tileTypes.map((type) => ({
    id: nextTileId(),
    type,
    imagePath: getTileImagePath(type)
  }));
}


export function useMahjongDeal(): MahjongDealHook {
  // 基本状態
  const [handTiles, setHandTiles] = useState<Tile[]>([]);
  const [poolTiles, setPoolTiles] = useState<Tile[]>([]);
  const [dora, setDora] = useState<TileType>("1m");
  const [doraTile, setDoraTile] = useState<Tile | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('initial');
  const [error, setError] = useState<string | null>(null);

  // CPU状態
  const [cpuState, setCpuState] = useState<CpuState | null>(null);

  // 対局状態
  const [playerDiscards, setPlayerDiscards] = useState<Tile[]>([]);
  const [cpuDiscards, setCpuDiscards] = useState<Tile[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isProcessingWin, setIsProcessingWin] = useState(false);

  // 和了情報
  const [winningInfo, setWinningInfo] = useState<WinningInfo | null>(null);

  // 分析状態
  const [suggestions, setSuggestions] = useState<TenpaiPattern[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 牌を配布する関数
  const dealTiles = () => {
    setError(null);
    const raw = dealMahjong();

    // プレイヤーの牌を生成（34枚）
    const playerTiles = convertToTiles(raw.player1);

    // CPUの牌を生成して整理
    const cpuTiles = convertToTiles(raw.player2);
    const newCpuState = setupCpuTiles(cpuTiles);

    // ドラ牌を生成
    const newDoraTile = {
      id: nextTileId(),
      type: raw.dora,
      imagePath: getTileImagePath(raw.dora)
    };

    // 状態を更新
    setDora(raw.dora);
    setDoraTile(newDoraTile);
    setHandTiles([]);  // プレイヤーの手牌（選択中）
    setPoolTiles(sortTiles(playerTiles));  // 選択可能な牌
    setCpuState(newCpuState);
    setGamePhase('selecting');
    setIsPlayerTurn(true);
    setPlayerDiscards([]);
    setCpuDiscards([]);
    setSuggestions(null);
  };

  // ゲームをリセット
  const reset = () => {
    setError(null);
    setDora("1m");
    setDoraTile(null);
    setHandTiles([]);
    setPoolTiles([]);
    setCpuState(null);
    setGamePhase('initial');
    setIsPlayerTurn(true);
    setPlayerDiscards([]);
    setCpuDiscards([]);
    setWinningInfo(null);
    setSuggestions(null);
    setIsAnalyzing(false);
    setIsProcessingWin(false);
  };

  // 手牌選択完了の処理
  const completeSelection = () => {
    if (gamePhase !== 'selecting' || handTiles.length !== 13) {
      return;
    }

    // 残りの21枚を選択可能な捨て牌として設定
    const remainingTiles = poolTiles.filter(tile =>
      !handTiles.some(handTile => handTile.id === tile.id)
    );

    setPoolTiles(remainingTiles);  // 選択可能な捨て牌
    setGamePhase('playing');
    setIsPlayerTurn(true);
  };

  // ゾーン間移動
  const moveTile = (
    tileId: string,
    fromZone: Zone,
    toZone: Zone,
    atIdx?: number
  ) => {
    if (gamePhase === 'initial') return;
    if (fromZone === toZone) return;

    let fromArr = fromZone === "hand" ? handTiles : poolTiles;
    let toArr = toZone === "hand" ? handTiles : poolTiles;
    const movingTile = fromArr.find((t) => t.id === tileId);

    if (!movingTile) return;
    if (toZone === "hand" && handTiles.length >= 13) return;

    // Remove from current zone
    fromArr = fromArr.filter((t) => t.id !== tileId);

    // Insert into new zone
    let newToArr;
    if (typeof atIdx === "number") {
      newToArr = [
        ...toArr.slice(0, atIdx),
        movingTile,
        ...toArr.slice(atIdx)
      ];
    } else {
      newToArr = [...toArr, movingTile];
    }

    if (fromZone === "hand") {
      setHandTiles(fromArr);
      setPoolTiles(toZone === "pool" ? sortTiles(newToArr) : newToArr);
    } else {
      setPoolTiles(sortTiles(fromArr));
      // 手牌に移動した場合は自動ソート
      const sortedHandTiles = sortTiles(newToArr);
      setHandTiles(sortedHandTiles);
      // 手牌が13枚になったかチェック
      if (sortedHandTiles.length === 13) {
        completeSelection();
      }
    }
    setSuggestions(null);
  };

  // ゾーン内並び替え
  const reorderZone = (
    zone: Zone,
    fromIdx: number,
    toIdx: number
  ) => {
    if (gamePhase === 'initial') return;
    const arr = zone === "hand" ? [...handTiles] : [...poolTiles];
    const [removed] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, removed);
    if (zone === "hand") {
      setHandTiles(arr);
    } else {
      setPoolTiles(sortTiles(arr));
    }
  };

  // プレイヤーの捨て牌を処理
  const discardTile = async (tile: Tile) => {
    // 前提条件チェック
    if (!isPlayerTurn || gamePhase !== 'playing' || !cpuState || isProcessingWin) {
      return;
    }

    // 和了判定処理中フラグを立てる
    setIsProcessingWin(true);

    // プレイヤーの捨て牌を記録
    setPlayerDiscards(prev => [...prev, tile]);
    setPoolTiles(prev => prev.filter(t => t.id !== tile.id));
    setIsPlayerTurn(false);

    // CPUの和了判定（ロン）
    if (tile.type === cpuState.winningTile.type) {
      try {
        const response = await fetch('/api/check-win', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tiles: cpuState.handTiles.map(t => t.type),
            lastTile: tile.type,
            dora
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.isWinning) {
            setWinningInfo({
              winner: 'cpu',
              points: result.points || 1,
              yaku: result.yaku || ['不明な役'],
              winningTile: tile.type,
              han: result.han,
              fu: result.fu
            });
            setGamePhase('finished');
            setIsProcessingWin(false);
            return;
          }
        }
      } catch (err) {
        console.error('CPU和了判定エラー:', err);
      }

      // ライブラリでの判定に失敗した場合、ランダムで和了
      setWinningInfo({
        winner: 'cpu',
        points: Math.floor(Math.random() * 3) + 1,
        yaku: ['ランダム和了', 'CPU特殊役'],
        winningTile: tile.type
      });
      setGamePhase('finished');
      setIsProcessingWin(false);
      return;
    }

    // CPUの捨て牌処理
    await new Promise(resolve => setTimeout(resolve, 1000));

    // CPUの捨て牌候補があるかチェック
    if (cpuDiscards.length >= cpuState.discardTiles.length) {
      console.log('CPUの捨て牌が不足しています');
      setGamePhase('finished');
      setIsProcessingWin(false);
      return;
    }

    const cpuDiscard = cpuState.discardTiles[cpuDiscards.length];
    setCpuDiscards(prev => [...prev, cpuDiscard]);
    setIsPlayerTurn(true);

    // プレイヤーの和了判定（ロン）
    try {
      const response = await fetch('/api/check-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiles: handTiles.map(t => t.type),
          lastTile: cpuDiscard.type,
          dora
        })
      });

      if (!response.ok) {
        console.error('和了判定API呼び出し失敗:', response.status, response.statusText);
        setIsProcessingWin(false);
        return;
      }

      const result = await response.json();

      if (result.isWinning) {
        setWinningInfo({
          winner: 'player',
          points: result.points || 1,
          yaku: result.yaku || ['不明な役'],
          winningTile: cpuDiscard.type,
          han: result.han,
          fu: result.fu
        });
        setGamePhase('finished');
      }

      setIsProcessingWin(false);
    } catch (err) {
      console.error('プレイヤー和了判定エラー:', err);
      setError('和了判定中にエラーが発生しました');
      setIsProcessingWin(false);
    }
  };

  const analyzeTenpai = async () => {
    if (gamePhase === 'initial') return;
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
    // 基本状態
    handTiles,
    poolTiles,
    dora,
    doraTile,
    gamePhase,
    error,

    // CPU状態
    cpuState,

    // 対局状態
    playerDiscards,
    cpuDiscards,
    isPlayerTurn,
    isProcessingWin,

    // 和了情報
    winningInfo,

    // 分析状態
    suggestions,
    isAnalyzing,

    // 操作
    reset,
    dealTiles,
    moveTile,
    reorderZone,
    completeSelection,
    discardTile,
    analyzeTenpai,

    // 派生状態
    hasDealt: gamePhase !== 'initial'
  };
}