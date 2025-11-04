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
  const [cpuInitialTiles, setCpuInitialTiles] = useState<Tile[]>([]);

  // 対局状態
  const [playerDiscards, setPlayerDiscards] = useState<Tile[]>([]);
  const [cpuDiscards, setCpuDiscards] = useState<Tile[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isProcessingWin, setIsProcessingWin] = useState(false);

  // 和了情報
  const [winningInfo, setWinningInfo] = useState<WinningInfo | null>(null);

  // スコア状態
  const [score, setScore] = useState<ScoreInfo>({ player: 0, cpu: 0 });

  // 聴牌モーダル状態
  const [tenpaiModal, setTenpaiModal] = useState<{
    isOpen: boolean;
    waitingTiles: string[];
    isTenpai: boolean;
    error?: string;
  }>({
    isOpen: false,
    waitingTiles: [],
    isTenpai: false
  });

  // 局数管理
  const [currentRound, setCurrentRound] = useState(1);

  // 分析状態
  const [suggestions, setSuggestions] = useState<TenpaiPattern[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 選択完了処理のローディング状態
  const [isCompletingSelection, setIsCompletingSelection] = useState(false);

  // ドラ表示牌を1つ戻す関数（Pythonに送る用）
  const getDoraForPython = (doraIndicator: string): string => {
    if (doraIndicator.endsWith('m') || doraIndicator.endsWith('p') || doraIndicator.endsWith('s')) {
      const num = parseInt(doraIndicator[0]);
      const suit = doraIndicator[1];
      return `${num === 1 ? 9 : num - 1}${suit}`;
    } else if (['東', '南', '西', '北'].includes(doraIndicator)) {
      // 東→南→西→北→東のサイクル（1つ戻す）
      const windCycle = ['東', '南', '西', '北'];
      const currentIndex = windCycle.indexOf(doraIndicator);
      return windCycle[(currentIndex - 1 + 4) % 4];
    } else if (['白', '發', '中'].includes(doraIndicator)) {
      // 白→發→中→白のサイクル（1つ戻す）
      const dragonCycle = ['白', '發', '中'];
      const currentIndex = dragonCycle.indexOf(doraIndicator);
      return dragonCycle[(currentIndex - 1 + 3) % 3];
    }
    return doraIndicator;
  };

  // スコア加算と勝利判定（飜数ベース）
  const addScore = (winner: 'player' | 'cpu', han: number) => {
    // 麻雀の点数計算（飜数ベース）
    let points = 0;

    if (han >= 13) {
      points = 13; // 役満
    } else if (han >= 11) {
      points = 11; // 三倍満
    } else if (han >= 8) {
      points = 8; // 倍満
    } else if (han >= 6) {
      points = 6; // 跳満
    } else if (han >= 5) {
      points = 5; // 満貫
    } else if (han >= 4) {
      points = 4; // 4飜
    } else if (han >= 3) {
      points = 3; // 3飜
    } else if (han >= 2) {
      points = 2; // 2飜
    } else {
      points = 1; // 1飜
    }

    console.log('スコア計算:', {
      winner: winner,
      han: han,
      calculatedPoints: points
    });

    setScore(prevScore => {
      const newScore = {
        player: winner === 'player' ? prevScore.player + points : prevScore.player,
        cpu: winner === 'cpu' ? prevScore.cpu + points : prevScore.cpu
      };
      console.log('スコア更新:', {
        previous: prevScore,
        new: newScore
      });
      return newScore;
    });
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
    setCpuInitialTiles([]);
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
    setCpuInitialTiles([]);
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
    setCpuInitialTiles(cpuTiles); // CPUの34枚を保存

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
      setCpuInitialTiles([]);
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
    if (gamePhase !== 'selecting' || handTiles.length !== 13 || isCompletingSelection) {
      return;
    }

    // ローディング状態を開始
    setIsCompletingSelection(true);
    setError(null);

    // 新しく生成されたCPU手牌を保存する変数
    let finalCpuHandTiles: Tile[] = [];

    // 1. CPU聴牌形生成（非同期）
    try {
      // 正しいCPUの34枚を取得
      const cpuTiles = cpuInitialTiles.map(t => t.type);

      const cpuResponse = await fetch('/api/generate-cpu-tenpai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiles: cpuTiles,
          dora
        })
      });

      if (cpuResponse.ok) {
        const cpuResult = await cpuResponse.json();

        if (cpuResult.success) {
          // CPU聴牌形を設定
          const cpuHandTiles = cpuResult.hand.map((tileType: string) => ({
            id: nextTileId(),
            type: tileType,
            imagePath: getTileImagePath(tileType)
          }));
          finalCpuHandTiles = cpuHandTiles; // 新しく生成された手牌を保存

          // CPU聴牌チェック
          const cpuTenpaiResponse = await fetch('/api/check-tenpai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tiles: cpuResult.hand,
              dora
            })
          });

          if (cpuTenpaiResponse.ok) {
            const cpuTenpaiResult = await cpuTenpaiResponse.json();

            if (cpuTenpaiResult.isTenpai) {
              // CPU聴牌成功 - 新しいCPU状態を設定
              const newCpuState = {
                handTiles: cpuHandTiles,
                discardTiles: [], // 後で設定
                winningTile: cpuTenpaiResult.waitingTiles.length > 0 ?
                  { id: 'cpu-winning', type: cpuTenpaiResult.waitingTiles[0], imagePath: getTileImagePath(cpuTenpaiResult.waitingTiles[0]) } :
                  { id: 'cpu-winning', type: '1m', imagePath: getTileImagePath('1m') }
              };
              await setCpuState(newCpuState);
            } else {
              // CPU聴牌失敗 - 七対子を作成
              const chiitoitsuResponse = await fetch('/api/generate-cpu-tenpai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  tiles: cpuTiles,
                  dora,
                  forceChiitoitsu: true
                })
              });

              if (chiitoitsuResponse.ok) {
                const chiitoitsuResult = await chiitoitsuResponse.json();
                if (chiitoitsuResult.success) {
                  const chiitoitsuHandTiles = chiitoitsuResult.hand.map((tileType: string) => ({
                    id: nextTileId(),
                    type: tileType,
                    imagePath: getTileImagePath(tileType)
                  }));
                  finalCpuHandTiles = chiitoitsuHandTiles; // 七対子手牌を保存

                  // 七対子作成後の聴牌チェック
                  const chiitoitsuTenpaiResponse = await fetch('/api/check-tenpai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      tiles: chiitoitsuResult.hand,
                      dora
                    })
                  });

                  if (chiitoitsuTenpaiResponse.ok) {
                    const chiitoitsuTenpaiResult = await chiitoitsuTenpaiResponse.json();
                    if (chiitoitsuTenpaiResult.isTenpai) {
                      // 七対子聴牌成功
                      const newCpuState = {
                        handTiles: chiitoitsuHandTiles,
                        discardTiles: [],
                        winningTile: chiitoitsuTenpaiResult.waitingTiles.length > 0 ?
                          { id: 'cpu-winning', type: chiitoitsuTenpaiResult.waitingTiles[0], imagePath: getTileImagePath(chiitoitsuTenpaiResult.waitingTiles[0]) } :
                          { id: 'cpu-winning', type: '1m', imagePath: getTileImagePath('1m') }
                      };
                      await setCpuState(newCpuState);
                    } else {
                      // 七対子聴牌失敗 - 適当に21枚を捨て牌候補に割り当て
                      const remainingTiles = cpuInitialTiles.filter(tile =>
                        !chiitoitsuResult.hand.includes(tile.type)
                      );
                      const shuffledRemainingTiles = shuffle(remainingTiles);
                      // ランダムなあたり牌を設定
                      const randomWinningTile = shuffledRemainingTiles[Math.floor(Math.random() * shuffledRemainingTiles.length)];
                      const newCpuState = {
                        handTiles: chiitoitsuHandTiles,
                        discardTiles: shuffledRemainingTiles.slice(0, 21),
                        winningTile: randomWinningTile || { id: 'cpu-winning', type: '1m', imagePath: getTileImagePath('1m') }
                      };
                      await setCpuState(newCpuState);
                    }
                  } else {
                    // 七対子聴牌チェック失敗 - 適当に21枚を捨て牌候補に割り当て
                    const remainingTiles = cpuInitialTiles.filter(tile =>
                      !chiitoitsuResult.hand.includes(tile.type)
                    );
                    const shuffledRemainingTiles = shuffle(remainingTiles);
                    // ランダムなあたり牌を設定
                    const randomWinningTile = shuffledRemainingTiles[Math.floor(Math.random() * shuffledRemainingTiles.length)];
                    const newCpuState = {
                      handTiles: chiitoitsuHandTiles,
                      discardTiles: shuffledRemainingTiles.slice(0, 21),
                      winningTile: randomWinningTile || { id: 'cpu-winning', type: '1m', imagePath: getTileImagePath('1m') }
                    };
                    await setCpuState(newCpuState);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('CPU聴牌形生成エラー:', error);
      // エラー時は適当なあたり牌を作成
      const randomTile = poolTiles[Math.floor(Math.random() * poolTiles.length)];
      const newCpuState = {
        handTiles: cpuState?.handTiles || [],
        discardTiles: [],
        winningTile: randomTile
      };
      await setCpuState(newCpuState);
      setIsCompletingSelection(false);
    }

    // 2. プレイヤー聴牌チェック
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
          // 聴牌でない場合はモーダルを表示
          setTenpaiModal({
            isOpen: true,
            waitingTiles: [],
            isTenpai: false,
            error: '選択した手牌は聴牌ではありません。別の組み合わせを選択してください。'
          });
          setIsCompletingSelection(false);
          return;
        }

        // 聴牌の場合は待ち牌を表示
        if (result.waitingTiles && result.waitingTiles.length > 0) {
          setTenpaiModal({
            isOpen: true,
            waitingTiles: result.waitingTiles,
            isTenpai: true
          });
        }
      } else {
        console.error('聴牌チェックエラー:', response.status);
        setTenpaiModal({
          isOpen: true,
          waitingTiles: [],
          isTenpai: false,
          error: '聴牌チェック中にエラーが発生しました。'
        });
        setIsCompletingSelection(false);
        return;
      }
    } catch (error) {
      console.error('聴牌チェックエラー:', error);
      setTenpaiModal({
        isOpen: true,
        waitingTiles: [],
        isTenpai: false,
        error: '聴牌チェック中にエラーが発生しました。'
      });
      setIsCompletingSelection(false);
      return;
    }

    // CPUの捨て牌候補を設定（CPU選択された13枚以外の21枚をランダム順で）
    // 新しく生成されたCPU手牌を直接使用

    // CPU選択された13枚の種類と枚数をカウント
    const selectedTileCounts = finalCpuHandTiles.reduce((acc, tile) => {
      acc[tile.type] = (acc[tile.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 各牌について、使用された分を除外
    const cpuDiscardTiles = [];
    const remainingCounts = { ...selectedTileCounts };

    for (const tile of cpuInitialTiles) {
      if (remainingCounts[tile.type] > 0) {
        remainingCounts[tile.type]--;
      } else {
        cpuDiscardTiles.push(tile);
      }
    }
    const shuffledCpuDiscardTiles = shuffle(cpuDiscardTiles);
    setCpuState(prev => prev ? {
      ...prev,
      handTiles: finalCpuHandTiles, // 新しく生成された手牌を設定
      discardTiles: shuffledCpuDiscardTiles
    } : null);

    // 残りの21枚を選択可能な捨て牌として設定
    // 元のpoolTilesから手牌に含まれていない牌を抽出
    const remainingTiles = poolTiles.filter(tile =>
      !handTiles.some(handTile => handTile.id === tile.id)
    );

    // 手牌はそのまま保持し、poolTilesを残りの牌に更新
    setPoolTiles(remainingTiles);  // 選択可能な捨て牌
    setGamePhase('playing');
    setIsPlayerTurn(true);
    setIsCompletingSelection(false);

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

    // 対局フェーズ中は牌の移動を制限
    if (gamePhase === 'playing') {
      console.warn('対局フェーズ中は牌の移動はできません');
      return;
    }

    let fromArr = fromZone === "hand" ? handTiles : poolTiles;
    const toArr = toZone === "hand" ? handTiles : poolTiles;
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
    }
    // setSuggestions(null); // 牌を移動しても提案を保持する
  };

  // ゾーン内並び替え
  const reorderZone = (
    zone: Zone,
    fromIdx: number,
    toIdx: number
  ) => {
    if (gamePhase === 'title') return;

    // 対局フェーズ中は牌の並び替えを制限
    if (gamePhase === 'playing') {
      console.warn('対局フェーズ中は牌の並び替えはできません');
      return;
    }
    const arr = zone === "hand" ? [...handTiles] : [...poolTiles];
    const [removed] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, removed);
    if (zone === "hand") {
      setHandTiles(arr);
    } else {
      setPoolTiles(sortTiles(arr));
    }
    // 並び替えでも提案を保持する（setSuggestions(null)を削除）
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

    // 捨て牌をpoolTilesから削除（手牌は変更しない）
    // 状態更新を一括で行い、競合を防ぐ
    setPoolTiles(prev => prev.filter(t => t.id !== tile.id));
    setIsPlayerTurn(false);


    // CPUの和了判定（ロン）- プレイヤーの捨て牌ごとにcheck-win APIを使用
    try {
      const response = await fetch('/api/check-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiles: cpuState.handTiles.map(t => t.type),
          lastTile: tile.type,
          dora: getDoraForPython(dora) // ドラ表示牌を1つ戻して送信
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.isWinning) {
          const han = result.han || 1;
          console.log('CPU和了判定結果:', {
            han: han,
            yaku: result.yaku,
            fu: result.fu,
            points: result.points
          });
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

    // CPUの捨て牌後に追加の待機時間を設ける
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsPlayerTurn(true);

    // 流局判定（CPUの捨て牌後）
    // poolTilesの現在の状態を確認
    setPoolTiles(currentPoolTiles => {
      if (currentPoolTiles.length === 0) {
        // 流局時にCPUの当たり牌を判定
        checkCpuWinningTiles();
        setGamePhase('draw');
        setIsProcessingWin(false);
        return currentPoolTiles;
      }
      return currentPoolTiles;
    });

    // プレイヤーの和了判定（ロン）
    try {
      // 状態の更新が確実に完了するまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await fetch('/api/check-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiles: handTiles.map(t => t.type),
          lastTile: cpuDiscard.type,
          dora: getDoraForPython(dora) // ドラ表示牌を1つ戻して送信
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
        console.log('和了判定結果:', {
          han: han,
          yaku: result.yaku,
          fu: result.fu,
          points: result.points
        });
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

  // 聴牌モーダルを閉じる関数
  const closeTenpaiModal = () => {
    setTenpaiModal({
      isOpen: false,
      waitingTiles: [],
      isTenpai: false
    });
  };

  // CPUの当たり牌を判定する関数
  const checkCpuWinningTiles = async () => {
    if (!cpuState) return;

    try {
      const response = await fetch('/api/check-tenpai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiles: cpuState.handTiles.map(t => t.type),
          dora
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.isTenpai && result.waitingTiles && result.waitingTiles.length > 0) {
          // 待ち牌をTileオブジェクトに変換
          const winningTiles = result.waitingTiles.map((tileType: string) => ({
            id: `cpu-winning-${tileType}-${Date.now()}`,
            type: tileType as TileType,
            imagePath: getTileImagePath(tileType as TileType)
          }));

          // CPU状態を更新して当たり牌を追加
          setCpuState(prev => prev ? {
            ...prev,
            winningTiles
          } : null);
        }
      }
    } catch (error) {
      console.error('CPU当たり牌判定エラー:', error);
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
    isCompletingSelection,

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
    closeTenpaiModal,

    // 派生状態
    hasDealt: poolTiles.length > 0,
    currentRound,
    tenpaiModal
  };
}