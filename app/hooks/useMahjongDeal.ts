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
  WinningInfo,
  ScoreInfo
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
  const [gamePhase, setGamePhase] = useState<GamePhase>('title');
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

  // スコア状態
  const [score, setScore] = useState<ScoreInfo>({ player: 0, cpu: 0 });

  // 局数管理
  const [currentRound, setCurrentRound] = useState(1);

  // 分析状態
  const [suggestions, setSuggestions] = useState<TenpaiPattern[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // スコア加算と勝利判定（飜数ベース）
  const addScore = (winner: 'player' | 'cpu', han: number) => {
    // 飜数をそのままスコアに加算（1飜=1ポイント）
    const points = han || 1; // hanが0の場合は1ポイント
    setScore(prevScore => {
      const newScore = {
        player: winner === 'player' ? prevScore.player + points : prevScore.player,
        cpu: winner === 'cpu' ? prevScore.cpu + points : prevScore.cpu
      };
      return newScore;
    });
  };

  // 勝利判定（5ポイント先取）
  const checkWinCondition = (): boolean => {
    return score.player >= 5 || score.cpu >= 5;
  };

  // ゲーム開始
  const startGame = () => {
    setGamePhase('selecting');
    setCurrentRound(1);
    setScore({ player: 0, cpu: 0 });
    setWinningInfo(null);
    setError(null);
    setSuggestions(null);
    // 牌IDカウンターをリセット
    tileIdCounter = 0;
  };

  // 次の局へ
  const nextRound = () => {
    setGamePhase('selecting');
    setCurrentRound(prev => prev + 1);
    setWinningInfo(null);
    setError(null);
    setSuggestions(null);
    setHandTiles([]);
    setPoolTiles([]);
    setCpuState(null);
    setPlayerDiscards([]);
    setCpuDiscards([]);
    setIsPlayerTurn(true);
    setIsProcessingWin(false);
    // 牌IDカウンターをリセット
    tileIdCounter = 0;
  };

  // ゲーム終了（タイトル画面に戻る）
  const endGame = () => {
    setGamePhase('title');
    setCurrentRound(1);
    setScore({ player: 0, cpu: 0 });
    setWinningInfo(null);
    setError(null);
    setSuggestions(null);
    setHandTiles([]);
    setPoolTiles([]);
    setCpuState(null);
    setPlayerDiscards([]);
    setCpuDiscards([]);
    setIsPlayerTurn(true);
    setIsProcessingWin(false);
    // 牌IDカウンターをリセット
    tileIdCounter = 0;
  };

  // 牌を配布する関数
  const dealTiles = () => {
    setError(null);
    // 牌IDカウンターをリセット
    tileIdCounter = 0;
    const raw = dealMahjong();

    // すべての牌を一度に生成（プレイヤー + CPU + ドラ）
    const allTiles = convertToTiles([...raw.player1, ...raw.player2, raw.dora]);

    // プレイヤーの牌（最初の34枚）
    const playerTiles = allTiles.slice(0, 34);

    // CPUの牌（次の34枚）
    const cpuTiles = allTiles.slice(34, 68);

    // ドラ牌（最後の1枚）
    const newDoraTile = allTiles[68];

    const newCpuState = setupCpuTiles(cpuTiles);

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

  // 手牌ゾーンの牌をすべて戻す
  const reset = () => {
    if (gamePhase === 'selecting' && handTiles.length > 0) {
      // 手牌ゾーンの牌をすべてプールに戻す
      const allTiles = [...handTiles, ...poolTiles];
      setHandTiles([]);
      setPoolTiles(sortTiles(allTiles));
    } else if (gamePhase === 'finished' || gamePhase === 'draw') {
      // 和了画面または流局画面から新しいゲームを始める
      setGamePhase('title');
      setHandTiles([]);
      setPoolTiles([]);
      setCpuState(null);
      setPlayerDiscards([]);
      setCpuDiscards([]);
      setWinningInfo(null);
      setIsPlayerTurn(true);
      setIsProcessingWin(false);
      setError(null);
      setSuggestions(null);
    }
  };

  // 手牌選択完了の処理
  const completeSelection = async () => {
    if (gamePhase !== 'selecting' || handTiles.length !== 13) {
      return;
    }

    // 聴牌チェック
    try {
      const response = await fetch('/api/check-tenpai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiles: handTiles.map(t => t.type),
          dora
        })
      });

      if (response.ok) {
        const result = await response.json();

        if (!result.isTenpai) {
          // 聴牌でない場合はアラートを表示
          alert('選択した手牌は聴牌ではありません。別の組み合わせを選択してください。');
          return;
        }

        // 聴牌の場合は待ち牌を表示
        if (result.waitingTiles && result.waitingTiles.length > 0) {
          alert(`聴牌です！待ち牌: ${result.waitingTiles.join(', ')}`);
        }
      } else {
        console.error('聴牌チェックエラー:', response.status);
        alert('聴牌チェック中にエラーが発生しました。');
        return;
      }
    } catch (error) {
      console.error('聴牌チェックエラー:', error);
      alert('聴牌チェック中にエラーが発生しました。');
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
    if (gamePhase === 'title') return;
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
    if (gamePhase === 'title') return;
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
    const newPoolTiles = poolTiles.filter(t => t.id !== tile.id);
    setPoolTiles(newPoolTiles);
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
            const han = result.han || 1;
            addScore('cpu', han);
            setWinningInfo({
              winner: 'cpu',
              points: result.points || 1,
              yaku: result.yaku || ['不明な役'],
              winningTile: tile.type,
              han: han,
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
      const han = Math.floor(Math.random() * 3) + 1;
      addScore('cpu', han);
      setWinningInfo({
        winner: 'cpu',
        points: han * 1000, // 表示用の点数（飜数×1000）
        yaku: ['ランダム和了', 'CPU特殊役'],
        winningTile: tile.type,
        han: han
      });
      setGamePhase('finished');
      setIsProcessingWin(false);
      return;
    }

    // プレイヤーが最後の1枚を捨てた場合は、CPUの捨て牌後に流局判定する

    // CPUの捨て牌処理
    await new Promise(resolve => setTimeout(resolve, 1000));

    // CPUの捨て牌候補があるかチェック
    if (cpuDiscards.length >= cpuState.discardTiles.length) {
      console.log('CPUの捨て牌が不足しています');
      setGamePhase('draw');
      setIsProcessingWin(false);
      return;
    }

    const cpuDiscard = cpuState.discardTiles[cpuDiscards.length];
    setCpuDiscards(prev => [...prev, cpuDiscard]);
    setIsPlayerTurn(true);

    // 流局判定（CPUの捨て牌後）
    if (newPoolTiles.length === 0) {
      setGamePhase('draw');
      setIsProcessingWin(false);
      return;
    }

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
        const han = result.han || 1;
        addScore('player', han);
        setWinningInfo({
          winner: 'player',
          points: result.points || 1,
          yaku: result.yaku || ['不明な役'],
          winningTile: cpuDiscard.type,
          han: han,
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
    if (gamePhase === 'title') return;
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

    // スコア情報
    score,

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
    startGame,
    nextRound,
    endGame,

    // 派生状態
    hasDealt: poolTiles.length > 0,
    currentRound
  };
}