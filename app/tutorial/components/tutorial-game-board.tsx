'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HandZone } from '../../components/game/hand-zone';
import { MahjongGrid } from '../../components/game/mahjong-grid';
import { MahjongTile } from '../../components/game/mahjong-tile';
import { DoraIndicator } from '../../components/game/dora-indicator';
import { Tile } from '../../components/game/types';
import { Button } from '@/components/ui/button';
import { TutorialPopup } from './tutorial-popup';
import { getTileImagePath } from '@/app/lib/mahjong';
import Image from 'next/image';
import Link from 'next/link';

// チュートリアル用の固定データ
const TUTORIAL_DATA = {
  // 34枚の配牌
  allTiles: [
    '1m', '2m', '3m', '5m', '5m', '6m', '7m', '7m', // 萬子
    '1p', '1p', '2p', '4p', '4p', '5p', '6p', '8p', '9p', // 筒子
    '1s', '2s', '4s', '5s', '8s', '8s', '9s', '9s', '9s', // 索子
    '東', '東', '南', '南', '北', '白', '發', '中' // 字牌
  ],
  // 選択する13枚
  targetHand: ['1m', '2m', '3m', '4p', '5p', '6p', '9s', '9s', '9s', '4s', '5s', '南', '南'],
  // CPUの捨て牌（順番）
  cpuDiscards: ['東', '5p', '西', '9m', '8m', '3s'],
  // ドラ表示牌
  dora: '5s'
};

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  showPopup: boolean;
}

export function TutorialGameBoard() {
  // ゲーム状態
  const [handTiles, setHandTiles] = useState<Tile[]>([]);
  const [poolTiles, setPoolTiles] = useState<Tile[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gamePhase, setGamePhase] = useState<'selecting' | 'playing' | 'finished'>('selecting');
  const [playerDiscards, setPlayerDiscards] = useState<Tile[]>([]);
  const [cpuDiscards, setCpuDiscards] = useState<Tile[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winningInfo, setWinningInfo] = useState<any>(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const winTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ポップアップ表示状態を管理
  const [showStep0Popup, setShowStep0Popup] = useState(true);
  const [showStep1Popup, setShowStep1Popup] = useState(false);
  const [showStep2Popup, setShowStep2Popup] = useState(false);
  const [showStep2CompletePopup, setShowStep2CompletePopup] = useState(false);

  // チュートリアルステップ（ポップアップ表示するもののみ）
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: '🎮 チュートリアルへようこそ！',
      description: 'このチュートリアルでは、麻雀の基本的な流れを体験できます。まずは配牌から始めましょう。',
      showPopup: true
    },
    {
      id: 'deal',
      title: '🎲 配牌について',
      description: '34枚の牌が配られました。この中から13枚を選んで手牌を作ります。麻雀では「4面子1雀頭」の形を目指します。',
      showPopup: true
    },
    {
      id: 'select',
      title: '🀄 手牌選択',
      description: 'クリックで牌を手牌エリアに移動してください。今回は下の例にある牌を選んでみましょう。\n\n推奨手牌を選ぶと、選択完了ボタンが有効になります。',
      showPopup: true
    },
    {
      id: 'playing_start',
      title: '🎯 対局開始',
      description: '聴牌が確認できました！これから対局が始まります。相手の捨て牌で和了できる牌を待ちましょう。',
      showPopup: false // 自動で進むためポップアップなし
    },
    {
      id: 'discard',
      title: '🀄 捨て牌選択',
      description: 'あなたの番です。捨て牌候補から1枚を選んで捨ててください。今回は「東」を捨ててみましょう。',
      showPopup: true
    },
    {
      id: 'game_end',
      title: '🎊 ゲーム終了',
      description: 'どちらかが上がるか、すべての牌を捨てきるまで対局が続きました。\n\nこのチュートリアルでは、プレイヤーが必ず勝てる設定になっています。',
      showPopup: true
    }
  ];

  // ステップ4（捨て牌選択）のポップアップは、playingフェーズに入った直後に一度だけ表示
  const [hasShownDiscardPopup, setHasShownDiscardPopup] = useState(false);
  const [hasClosedDiscardPopup, setHasClosedDiscardPopup] = useState(false);

  // playingフェーズに入った時にステップ4のポップアップを表示（一度閉じた後は再表示しない）
  useEffect(() => {
    if (gamePhase === 'playing' && currentStep === 4 && !hasShownDiscardPopup && !hasClosedDiscardPopup) {
      setHasShownDiscardPopup(true);
    }
    // ステップ4を離れたらリセット
    if (currentStep !== 4) {
      setHasClosedDiscardPopup(false);
      setHasShownDiscardPopup(false);
    }
  }, [gamePhase, currentStep, hasShownDiscardPopup, hasClosedDiscardPopup]);

  // ステップ2で13枚選択された時にポップアップを表示
  useEffect(() => {
    if (currentStep === 2 && handTiles.length === 13 && gamePhase === 'selecting') {
      setShowStep2CompletePopup(true);
    } else if (handTiles.length !== 13) {
      setShowStep2CompletePopup(false);
    }
  }, [handTiles.length, currentStep, gamePhase]);

  // ポップアップ表示判定
  const showPopup =
    (currentStep === 0 && showStep0Popup) ||
    (currentStep === 1 && showStep1Popup) ||
    (currentStep === 2 && (showStep2Popup || showStep2CompletePopup)) ||
    (currentStep === 4 && hasShownDiscardPopup) ||
    (currentStep === 5 && gamePhase === 'finished');

  // 牌をTileオブジェクトに変換
  const convertToTiles = (tileTypes: string[]): Tile[] => {
    return tileTypes.map((type, index) => ({
      id: `tutorial-${type}-${index}`,
      type,
      imagePath: getTileImagePath(type)
    }));
  };

  // 初期化
  useEffect(() => {
    const allTiles = convertToTiles(TUTORIAL_DATA.allTiles);
    setPoolTiles(allTiles);
    setHandTiles([]);
    setCurrentStep(0);
    setGamePhase('selecting');
  }, []);

  // 和了後3秒でポップアップ表示（和了時のみ）
  useEffect(() => {
    if (gamePhase === 'finished' && winningInfo && currentStep === 7) {
      if (winTimerRef.current) {
        clearTimeout(winTimerRef.current);
      }
      winTimerRef.current = setTimeout(() => {
        setShowCompletionPopup(true);
      }, 3000);
    }

    return () => {
      if (winTimerRef.current) {
        clearTimeout(winTimerRef.current);
      }
    };
  }, [gamePhase, winningInfo, currentStep]);

  // 選択可能な牌かチェック（ステップ2ではtargetHandのみ選択可能）
  const isTileSelectable = (tile: Tile): boolean => {
    if (gamePhase !== 'selecting' || currentStep !== 2) {
      return true; // ステップ2以外ではすべて選択可能
    }

    // 既に手牌に含まれている牌の種類と枚数をカウント
    const handTileTypes = handTiles.map(t => t.type);
    const targetHandCounts = new Map<string, number>();
    TUTORIAL_DATA.targetHand.forEach(type => {
      targetHandCounts.set(type, (targetHandCounts.get(type) || 0) + 1);
    });

    const currentHandCounts = new Map<string, number>();
    handTileTypes.forEach(type => {
      currentHandCounts.set(type, (currentHandCounts.get(type) || 0) + 1);
    });

    // targetHandに含まれていて、まだ必要な枚数が残っている場合のみ選択可能
    const neededCount = targetHandCounts.get(tile.type) || 0;
    const currentCount = currentHandCounts.get(tile.type) || 0;

    return neededCount > currentCount;
  };

  // 牌の移動（クリック操作）
  const moveTile = (tileId: string, fromZone: 'hand' | 'pool', toZone: 'hand' | 'pool') => {
    // ポップアップ表示中（完了ポップアップを除く）は移動不可
    if (gamePhase !== 'selecting' || (showPopup && !showStep2CompletePopup)) return;

    let fromArr = fromZone === 'hand' ? handTiles : poolTiles;
    const toArr = toZone === 'hand' ? handTiles : poolTiles;
    const movingTile = fromArr.find(t => t.id === tileId);

    if (!movingTile) return;
    if (toZone === 'hand' && handTiles.length >= 13) return;

    // ステップ2では選択可能な牌のみ移動可能
    if (toZone === 'hand' && !isTileSelectable(movingTile)) return;

    // 移動処理
    const newFromArr = fromArr.filter(t => t.id !== tileId);
    const newToArr = [...toArr, movingTile];

    if (fromZone === 'hand') {
      setHandTiles(newFromArr);
      setPoolTiles(newToArr);
    } else {
      setPoolTiles(newFromArr);
      setHandTiles(newToArr);
    }
  };

  // ポップアップの「次へ」ボタン
  const handlePopupNext = () => {
    if (currentStep === 0 && showStep0Popup) {
      // ステップ0 → 1
      setShowStep0Popup(false);
      setCurrentStep(1);
      setShowStep1Popup(true);
    } else if (currentStep === 1 && showStep1Popup) {
      // ステップ1 → 2
      setShowStep1Popup(false);
      setCurrentStep(2);
      setShowStep2Popup(true);
    } else if (currentStep === 2 && showStep2Popup) {
      // ステップ2 → ポップアップを閉じて牌選択可能に
      setShowStep2Popup(false);
    } else if (currentStep === 2 && showStep2CompletePopup) {
      // ステップ2完了ポップアップ → 閉じるだけ（選択完了ボタンを押せるように）
      setShowStep2CompletePopup(false);
    } else if (currentStep === 4 && hasShownDiscardPopup) {
      // ステップ4 → 捨て牌選択（ポップアップを閉じるだけ）
      setHasShownDiscardPopup(false);
      setHasClosedDiscardPopup(true);
    } else if (currentStep === 5) {
      // ステップ5（ゲーム終了）→ 和了画面へ
      setGamePhase('finished');
      setCurrentStep(7);
    }
  };

  // 選択完了
  const completeSelection = () => {
    if (handTiles.length !== 13) return;
    if (showStep2CompletePopup) return; // ポップアップ表示中は実行不可

    // 聴牌チェック（簡易版 - チュートリアルでは常に成功）
    setCurrentStep(4);
    setGamePhase('playing');
    setIsPlayerTurn(true);
  };

  // 捨て牌処理
  const discardTile = (tile: Tile) => {
    if (!isPlayerTurn || gamePhase !== 'playing') return;
    if (hasShownDiscardPopup && !hasClosedDiscardPopup) return; // ポップアップ表示中は実行不可

    const newPoolTiles = poolTiles.filter(t => t.id !== tile.id);
    setPoolTiles(newPoolTiles);
    setPlayerDiscards(prev => [...prev, tile]);
    setIsPlayerTurn(false);

    // CPUの捨て牌
    setTimeout(() => {
      const cpuDiscardIndex = cpuDiscards.length;
      if (cpuDiscardIndex < TUTORIAL_DATA.cpuDiscards.length) {
        const cpuDiscardType = TUTORIAL_DATA.cpuDiscards[cpuDiscardIndex];
        const cpuDiscard = convertToTiles([cpuDiscardType])[0];
        setCpuDiscards(prev => [...prev, cpuDiscard]);

        // 和了判定（3sで和了）
        if (cpuDiscardType === '3s') {
          setWinningInfo({
            winner: 'player',
            winningTile: '3s',
            yaku: ['タンヤオ', '平和'],
            han: 2
          });
          setGamePhase('finished');
          setCurrentStep(7);
        } else {
          setIsPlayerTurn(true);
        }
      } else {
        // すべてのCPU捨て牌を使い切った場合
        setGamePhase('finished');
        setCurrentStep(5);
      }
    }, 1000);
  };

  // 現在のステップデータを取得
  const getCurrentStepData = () => {
    if (currentStep === 0) return tutorialSteps[0];
    if (currentStep === 1) return tutorialSteps[1];
    if (currentStep === 2) return tutorialSteps[2];
    if (currentStep === 4) return tutorialSteps[4];
    if (currentStep === 5) return tutorialSteps[5];
    return tutorialSteps[0];
  };
  const currentStepData = getCurrentStepData();

  return (
    <div className="container mx-auto p-4 relative">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white font-japanese mb-2">
          🎮 麻雀チュートリアル
        </h1>
      </div>

      {/* ゲーム画面 */}
      {gamePhase === 'selecting' && (
        <>
          <section className="bg-black/20 rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-japanese font-bold text-2xl text-white">
                手札選択（13枚を選んでください）
              </h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const allTiles = convertToTiles(TUTORIAL_DATA.allTiles);
                    setHandTiles([]);
                    setPoolTiles(allTiles);
                  }}
                  disabled={showPopup && !showStep2CompletePopup}
                  variant="mahjong"
                  className="px-6 py-3 bg-gradient-to-r from-mahjong-red-600 to-mahjong-red-700 text-white rounded-xl border-2 border-mahjong-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔄 リセット
                </Button>
                <Button
                  onClick={completeSelection}
                  disabled={handTiles.length !== 13 || (showPopup && !showStep2CompletePopup)}
                  variant="mahjong"
                  className={`px-6 py-3 rounded-xl font-semibold ${handTiles.length === 13 && (!showPopup || showStep2CompletePopup)
                    ? 'bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-white border-2 border-mahjong-gold-400/50'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  ✅ 選択完了 ({handTiles.length}/13枚)
                </Button>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <HandZone
                tiles={handTiles}
                onTileClick={(tileId) => {
                  if (!showPopup || showStep2CompletePopup) {
                    moveTile(tileId, 'hand', 'pool');
                  }
                }}
              />
            </div>
          </section>

          <section className="bg-black/20 rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-japanese font-bold text-2xl text-white">牌プール</h2>
              <DoraIndicator dora={TUTORIAL_DATA.dora} />
            </div>
            <MahjongGrid
              tiles={poolTiles}
              onTileClick={(tileId) => {
                if (!showPopup || showStep2CompletePopup) {
                  moveTile(tileId, 'pool', 'hand');
                }
              }}
              dora={TUTORIAL_DATA.dora}
              isTileDisabled={(tile) => {
                if (gamePhase !== 'selecting' || currentStep !== 2) return false;
                return !isTileSelectable(tile);
              }}
            />
          </section>
        </>
      )}

      {gamePhase === 'playing' && (
        <>
          {/* 手番表示 */}
          <div className={`p-6 rounded-2xl text-center font-japanese font-bold text-xl shadow-mahjong-button border-2 mb-6 ${isPlayerTurn
            ? 'bg-gradient-to-r from-mahjong-blue-500 to-mahjong-blue-600 text-white border-mahjong-blue-400'
            : 'bg-gradient-to-r from-mahjong-red-500 to-mahjong-red-600 text-white border-mahjong-red-400'
            }`}>
            {isPlayerTurn ? '🎯 あなたの番です' : '🤖 CPUの番です'}
          </div>

          {/* 捨て牌履歴 */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <section className="bg-black/20 rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
              <h2 className="mb-4 font-japanese font-bold text-2xl text-mahjong-blue-300">あなたの捨て牌</h2>
              <div className="bg-mahjong-blue-500/20 p-4 rounded-xl min-h-28 border-2 border-mahjong-blue-400/30">
                {playerDiscards.length === 0 ? (
                  <div className="text-mahjong-gold-300 text-center font-japanese font-semibold text-lg">
                    まだ捨て牌がありません
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2 justify-items-center">
                    {playerDiscards.map((tile) => (
                      <div key={`discard-${tile.id}`}>
                        <MahjongTile tile={tile} selected={false} priority={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            <section className="bg-black/20 rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
              <h2 className="mb-4 font-japanese font-bold text-2xl text-mahjong-red-300">CPUの捨て牌</h2>
              <div className="bg-mahjong-red-500/20 p-4 rounded-xl min-h-28 border-2 border-mahjong-red-400/30">
                {cpuDiscards.length === 0 ? (
                  <div className="text-mahjong-gold-300 text-center font-japanese font-semibold text-lg">
                    まだ捨て牌がありません
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-2 justify-items-center">
                    {cpuDiscards.map((tile) => (
                      <div key={`discard-${tile.id}`}>
                        <MahjongTile tile={tile} selected={false} priority={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* 選択可能な捨て牌 */}
          <section className="bg-black/20 rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-6">
            <h2 className="font-japanese font-bold text-2xl text-white mb-4">
              捨て牌を選択してください（{poolTiles.length}枚）
            </h2>
            <div className="flex flex-wrap gap-2 justify-center bg-mahjong-gold-500/20 p-6 rounded-xl border-2 border-mahjong-gold-400/30">
              {poolTiles.map((tile) => (
                <div
                  key={`pool-${tile.id}`}
                  onClick={() => {
                    if (isPlayerTurn && (!hasShownDiscardPopup || hasClosedDiscardPopup)) {
                      discardTile(tile);
                    }
                  }}
                  className={`${isPlayerTurn && (!hasShownDiscardPopup || hasClosedDiscardPopup)
                    ? 'cursor-pointer hover:opacity-75 hover:scale-105 transition-all'
                    : 'cursor-not-allowed opacity-50'
                    }`}
                >
                  <MahjongTile tile={tile} selected={false} priority={false} />
                </div>
              ))}
            </div>
          </section>

          {/* プレイヤーの手札 */}
          <section className="bg-black/20 rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-japanese font-bold text-2xl text-mahjong-blue-300">あなたの手札</h2>
              <DoraIndicator dora={TUTORIAL_DATA.dora} />
            </div>
            <div className="flex gap-2 justify-center bg-mahjong-blue-500/20 p-6 rounded-xl border-2 border-mahjong-blue-400/30">
              {handTiles.map((tile) => (
                <MahjongTile key={`hand-${tile.id}`} tile={tile} selected priority={true} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* 和了表示 */}
      {gamePhase === 'finished' && winningInfo && (
        <section className="mt-8">
          <div className="p-8 rounded-2xl text-center shadow-mahjong-tile-hover border-4 font-japanese bg-gradient-to-br from-mahjong-blue-500 to-mahjong-blue-700 border-mahjong-blue-400">
            <h2 className="text-4xl font-bold mb-6 text-white">
              🎉 和了！
            </h2>

            {/* 上がった形の表示 */}
            <div className="mb-8 bg-white/10 rounded-xl p-6 border-2 border-white/20">
              <h3 className="text-2xl font-bold mb-4 text-white font-japanese">上がった形</h3>
              <div className="flex flex-wrap justify-center items-center gap-4 mb-2">
                {/* 順子1: 1m2m3m */}
                <div className="flex gap-1 items-center">
                  {['1m', '2m', '3m'].map((tileType, idx) => (
                    <div key={`win-${tileType}-${idx}`} className="relative w-12 h-16">
                      <Image
                        src={getTileImagePath(tileType)}
                        alt={tileType}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>

                {/* 順子2: 4p5p6p */}
                <div className="flex gap-1 items-center">
                  {['4p', '5p', '6p'].map((tileType, idx) => (
                    <div key={`win-${tileType}-${idx}`} className="relative w-12 h-16">
                      <Image
                        src={getTileImagePath(tileType)}
                        alt={tileType}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>

                {/* 刻子: 9s9s9s */}
                <div className="flex gap-1 items-center">
                  {['9s', '9s', '9s'].map((tileType, idx) => (
                    <div key={`win-${tileType}-${idx}`} className="relative w-12 h-16">
                      <Image
                        src={getTileImagePath(tileType)}
                        alt={tileType}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>

                {/* 順子3（上がり）: 4s5s3s */}
                <div className="flex gap-1 items-center">
                  {['4s', '5s', '3s'].map((tileType, idx) => {
                    const isWinningTile = tileType === '3s';
                    return (
                      <div
                        key={`win-${tileType}-${idx}`}
                        className={`relative w-12 h-16 ${isWinningTile ? 'ring-4 ring-mahjong-gold-400 ring-offset-2 ring-offset-mahjong-blue-700 rounded' : ''}`}
                      >
                        <Image
                          src={getTileImagePath(tileType)}
                          alt={tileType}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                        {isWinningTile && (
                          <div className="absolute -top-2 -right-2 bg-mahjong-gold-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            和
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 雀頭: 南南 */}
                <div className="flex gap-1 items-center">
                  {['南', '南'].map((tileType, idx) => (
                    <div key={`win-${tileType}-${idx}`} className="relative w-12 h-16">
                      <Image
                        src={getTileImagePath(tileType)}
                        alt={tileType}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-sm text-white/80 font-japanese mt-2">
                上がり牌: 3s
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold mb-6 text-mahjong-gold-300 font-japanese">
                {winningInfo.han}ポイント
              </div>
              <div className="mb-6">
                <div className="font-japanese font-bold mb-4 text-white text-xl">成立した役：</div>
                <div className="flex flex-wrap justify-center gap-3">
                  {winningInfo.yaku.map((yaku: string) => (
                    <span
                      key={yaku}
                      className="px-4 py-2 bg-mahjong-gold-500/90 text-white rounded-full text-sm font-japanese font-semibold border-2 border-mahjong-gold-400 shadow-mahjong-tile"
                    >
                      {yaku}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* チュートリアルポップアップ */}
      <TutorialPopup
        isOpen={showPopup}
        onNext={handlePopupNext}
        title={
          currentStep === 2 && showStep2CompletePopup
            ? '✅ 13枚選択完了！'
            : currentStepData?.title || ''
        }
      >
        <div className="space-y-4">
          <p className="text-lg text-black whitespace-pre-line leading-relaxed">
            {currentStep === 2 && showStep2CompletePopup
              ? '13枚の手牌を選択できました！\n\n「選択完了」ボタンを押して聴牌チェックを行います。'
              : currentStepData?.description}
          </p>
          {currentStep === 2 && showStep2Popup && (
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 mt-6">
              <h4 className="font-bold text-black mb-2 font-japanese">推奨手牌</h4>
              <div className="flex gap-1 justify-center flex-wrap">
                {TUTORIAL_DATA.targetHand.map((tileType, index) => (
                  <div key={index} className="relative w-10 h-14">
                    <Image
                      src={getTileImagePath(tileType)}
                      alt={tileType}
                      fill
                      sizes="40px"
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TutorialPopup>

      {/* チュートリアル完了ポップアップ */}
      <TutorialPopup
        isOpen={showCompletionPopup}
        onNext={() => {
          // 何もしない（チュートリアル終了ボタンのみ）
        }}
        title="🎉 チュートリアル完了！"
        showNextButton={false}
      >
        <div className="space-y-6">
          <p className="text-xl text-black leading-relaxed font-japanese">
            おめでとうございます！チュートリアルを完了しました。
          </p>
          {winningInfo && (
            <div className="bg-gradient-to-r from-mahjong-gold-50 to-mahjong-gold-100 rounded-xl p-6 border-2 border-mahjong-gold-300">
              <h4 className="font-bold text-black mb-4 font-japanese text-xl">今回の結果</h4>
              <div className="space-y-3">
                <div className="text-lg">
                  <span className="font-semibold text-black font-japanese">ポイント: </span>
                  <span className="text-2xl font-bold text-black">{winningInfo.han}ポイント</span>
                </div>
                <div>
                  <span className="font-semibold text-black font-japanese">成立した役: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {winningInfo.yaku.map((yaku: string) => (
                      <span
                        key={yaku}
                        className="px-3 py-1 bg-mahjong-gold-500 text-black rounded-full text-sm font-japanese font-semibold"
                      >
                        {yaku}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-center pt-4">
            <Link href="/">
              <Button
                variant="mahjong"
                className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-black rounded-xl border-2 border-mahjong-gold-400/50"
              >
                🏠 チュートリアル終了
              </Button>
            </Link>
          </div>
        </div>
      </TutorialPopup>
    </div>
  );
}
