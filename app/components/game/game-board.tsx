'use client';

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { useState, useEffect, useRef } from 'react';
import { HandZone } from './hand-zone';
import { MahjongGrid } from './mahjong-grid';
import { MahjongTile } from './mahjong-tile';
import { DoraIndicator } from './dora-indicator';
import { Tile } from './types';
import { TenpaiPattern, WinningInfo, ScoreInfo, YakuAnalysis, Melds } from '@/types';
import { GameHeader } from './game-header';
import { TitleScreen } from './title-screen';
import Image from 'next/image';
import { getTileImagePath } from '@/app/lib/mahjong';
import { translateYaku } from '@/lib/yaku-translations';
import { Button } from '@/components/ui/button';
import { HintPopup } from '@/app/components/ui/hint-popup';

interface Props {
  // 基本状態
  handTiles: Tile[];
  poolTiles: Tile[];
  dora: string;
  gamePhase: 'title' | 'selecting' | 'playing' | 'finished' | 'draw';
  error: string | null;

  // CPU状態
  cpuState: any | null;

  // 対局状態
  playerDiscards: Tile[];
  cpuDiscards: Tile[];
  isPlayerTurn: boolean;
  isProcessingWin: boolean;

  // 和了情報
  winningInfo: WinningInfo | null;

  // スコア情報
  score: ScoreInfo;

  // 操作
  moveTile: (tileId: string, fromZone: "hand" | "pool", toZone: "hand" | "pool", atIdx?: number) => void;
  reorderZone: (zone: "hand" | "pool", fromIdx: number, toIdx: number) => void;
  dealTiles: () => void;
  reset: () => void;
  completeSelection: () => void;
  analyzeTenpai: () => void;
  discardTile: (tile: Tile) => Promise<void>;
  startGame: () => void;
  nextRound: () => void;
  endGame: () => void;

  // 状態
  isAnalyzing: boolean;
  hasDealt: boolean;
  suggestions: TenpaiPattern[] | null;
  currentRound: number;
}

export function GameBoard({
  // 基本状態
  handTiles,
  poolTiles,
  dora,
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

  // 操作
  moveTile,
  reorderZone,
  dealTiles,
  reset,
  completeSelection,
  analyzeTenpai,
  discardTile,
  startGame,
  nextRound,
  endGame,

  // 状態
  isAnalyzing,
  hasDealt,
  suggestions,
  currentRound
}: Props) {
  const [activeTile, setActiveTile] = useState<Tile | null>(null);
  const [activeZone, setActiveZone] = useState<"hand" | "pool" | null>(null);
  const [isYakuHintOpen, setIsYakuHintOpen] = useState(false);
  const [selectedYakuForDetail, setSelectedYakuForDetail] = useState<string | null>(null);
  const [showDealPopup, setShowDealPopup] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // 役名を表示用に変換する関数（括弧内の色を牌画像に）
  const renderYakuName = (yakuName: string) => {
    const suitMatch = yakuName.match(/（(萬子|筒子|索子)）/);
    if (!suitMatch) {
      return <span>{yakuName}</span>;
    }

    const baseName = yakuName.replace(/（[^）]+）/g, '');
    const suit = suitMatch[1];
    const tileCode = suit === '萬子' ? '1m' : suit === '筒子' ? '1p' : '1s';

    return (
      <span className="flex items-center gap-2">
        <span>{baseName}</span>
        <div className="relative w-8 h-12 inline-block">
          <Image
            src={getTileImagePath(tileCode)}
            alt={suit}
            fill
            sizes="32px"
            className="object-contain"
            priority={false}
          />
        </div>
      </span>
    );
  };

  // 役の詳細情報を取得する関数
  const getYakuDetail = (yakuName: string) => {
    const yakuDetails: { [key: string]: { reading: string; points: string; tips: string; exampleTiles: string[]; winningTile?: string; highlightStart?: number; highlightEnd?: number } } = {
      'ドラ': {
        reading: 'ドラ',
        points: '1ポイント/枚',
        tips: 'ドラは役ではなく、得点を上げるボーナス牌です。ドラ表示牌の次の牌がドラになります（例：ドラ表示が5萬なら、ドラは6萬）。手札にドラが1枚あるごとに1ポイント追加されます。',
        exampleTiles: [],
      },
      '立直': {
        reading: 'リーチ',
        points: '1ポイント',
        tips: 'テンパイ（あと1枚で上がれる状態）になったときに宣言する役です。このゲームでは自動でリーチがかかります。リーチ後は手札を変更できません。',
        exampleTiles: ['2m', '3m', '4m', '5p', '6p', '7p', '8p', '8p', '8p', '3s', '4s', '9s', '9s'],
        winningTile: '2sまたは5s',
        highlightStart: 0,
        highlightEnd: 13
      },
      '白': {
        reading: 'ハク',
        points: '1ポイント',
        tips: '白（三元牌の1つ）を3枚揃える役です。役牌と呼ばれ、これだけで役になります。',
        exampleTiles: ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '4s', '5s', '白', '白', '白', '9m'],
        winningTile: '9m',
        highlightStart: 9,
        highlightEnd: 12
      },
      '發': {
        reading: 'ハツ',
        points: '1ポイント',
        tips: '發（三元牌の1つ）を3枚揃える役です。役牌と呼ばれ、これだけで役になります。',
        exampleTiles: ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '4s', '5s', '發', '發', '發', '9m'],
        winningTile: '9m',
        highlightStart: 9,
        highlightEnd: 12
      },
      '中': {
        reading: 'チュン',
        points: '1ポイント',
        tips: '中（三元牌の1つ）を3枚揃える役です。役牌と呼ばれ、これだけで役になります。',
        exampleTiles: ['2m', '3m', '4m', '5p', '6p', '7p', '3s', '4s', '5s', '中', '中', '中', '9m'],
        winningTile: '9m',
        highlightStart: 9,
        highlightEnd: 12
      },
      'タンヤオ': {
        reading: 'たんやお',
        points: '1ポイント',
        tips: '2〜8の数牌だけで手札を作る役です。1・9の数牌と字牌は使えません。初心者でも作りやすい基本的な役です。',
        exampleTiles: ['2m', '3m', '4m', '5p', '5p', '5p', '6p', '7p', '8p', '4s', '4s', '8s', '8s'],
        winningTile: '8s',
        highlightStart: 0,
        highlightEnd: 13
      },
      '平和': {
        reading: 'ピンフ',
        points: '1ポイント',
        tips: '順子3組と対子1組で作る役です。刻子は使えません。両面待ちで上がる必要があります。対子は数字牌（9s9s）で作ります。',
        exampleTiles: ['1m', '2m', '3m', '5p', '6p', '7p', '7s', '8s', '9s', '9s', '9s', '6m', '7m'],
        winningTile: '5mまたは8m',
        highlightStart: 0,
        highlightEnd: 13
      },
      '一盃口': {
        reading: 'イーペーコー',
        points: '1ポイント',
        tips: '同じ順子を2組作る役です。例えば「1-2-3の萬子」を2組揃えます。',
        exampleTiles: ['1m', '1m', '2m', '2m', '3m', '3m', '4p', '5p', '6p', '7p', '8p', '東', '東'],
        winningTile: '9p',
        highlightStart: 0,
        highlightEnd: 6
      },
      '七対子': {
        reading: 'チートイツ',
        points: '2ポイント',
        tips: '同じ牌2枚のペアを7組作る役です。順子や刻子は作らず、すべて対子で揃えます。',
        exampleTiles: ['1m', '1m', '3p', '3p', '5s', '5s', '6s', '6s', '東', '東', '北', '北', '中'],
        winningTile: '中',
        highlightStart: 0,
        highlightEnd: 13
      },
      '三暗刻': {
        reading: 'サンアンコー',
        points: '2ポイント',
        tips: '同じ牌3枚の刻子を3組作る役です。自分で引いた牌で刻子を作る必要があります。',
        exampleTiles: ['3m', '3m', '3m', '5p', '5p', '5p', '8s', '8s', '8s', '1s', '2s', '南', '南'],
        winningTile: '3s',
        highlightStart: 0,
        highlightEnd: 9
      },
      '対々和': {
        reading: 'トイトイホー',
        points: '2ポイント',
        tips: '刻子4組と対子1組で手札を作る役です。順子は使わず、すべて刻子と対子で揃えます。',
        exampleTiles: ['1m', '1m', '1m', '5m', '5m', '5m', '2p', '2p', '2p', '8p', '8p', '3s', '3s'],
        winningTile: '3s',
        highlightStart: 0,
        highlightEnd: 13
      },
      '小三元': {
        reading: 'ショウサンゲン',
        points: '2ポイント',
        tips: '白・發・中の三元牌のうち、2種類を刻子、1種類を対子にする役です。',
        exampleTiles: ['4m', '5m', '6m', '6p', '6p', '6p', '白', '白', '白', '發', '發', '中', '中'],
        winningTile: '發',
        highlightStart: 6,
        highlightEnd: 13
      },
      '混全帯么九': {
        reading: 'ホンチャンタイヤオチュー',
        points: '2ポイント',
        tips: 'すべての面子と対子に1・9の数牌か字牌を含める役です。中間の数牌だけでは作れません。',
        exampleTiles: ['1m', '2m', '3m', '9m', '9m', '9m', '1p', '1p', '1p', '西', '西', '1s', '2s'],
        winningTile: '3s',
        highlightStart: 0,
        highlightEnd: 13
      },
      '混老頭': {
        reading: 'ホンロートー',
        points: '2ポイント',
        tips: '1・9の数牌と字牌だけで手札を作る役です。2〜8の数牌は使えません。',
        exampleTiles: ['1m', '1m', '1m', '9p', '9p', '9p', '1s', '1s', '1s', '北', '北', '白', '白'],
        winningTile: '白',
        highlightStart: 0,
        highlightEnd: 13
      },
      '三色同順': {
        reading: 'サンショクドウジュン',
        points: '2ポイント',
        tips: '萬子・筒子・索子で同じ数字の順子を作る役です。例えば「4-5-6」を3色で揃えます。',
        exampleTiles: ['4m', '5m', '6m', '4p', '5p', '6p', '4s', '5s', '6s', '9s', '9s', '西', '西'],
        winningTile: '西',
        highlightStart: 0,
        highlightEnd: 9
      },
      '三色同刻': {
        reading: 'サンショクドウコー',
        points: '2ポイント',
        tips: '萬子・筒子・索子で同じ数字の刻子を作る役です。例えば「2」を3色で揃えます。',
        exampleTiles: ['2m', '2m', '2m', '2p', '2p', '2p', '2s', '2s', '2s', '5s', '6s', '北', '北'],
        winningTile: '4s',
        highlightStart: 0,
        highlightEnd: 9
      },
      '二盃口': {
        reading: 'リャンペーコー',
        points: '3ポイント',
        tips: '同じ順子を2組×2セット作る役です。一盃口が2つある状態です。高得点の役です。',
        exampleTiles: ['2m', '2m', '3m', '3m', '4m', '4m', '6p', '6p', '7p', '7p', '8p', '8p', '中'],
        winningTile: '中',
        highlightStart: 0,
        highlightEnd: 12
      },
      '純全帯么九': {
        reading: 'ジュンチャンタイヤオチュー',
        points: '3ポイント',
        tips: 'すべての面子と対子に1・9の数牌を含める役です。字牌は使えません。',
        exampleTiles: ['1m', '2m', '3m', '9m', '9m', '9m', '1p', '1p', '1p', '9p', '9p', '1s', '2s'],
        winningTile: '3s',
        highlightStart: 0,
        highlightEnd: 13
      },
      '清一色': {
        reading: 'チンイーソー',
        points: '6ポイント',
        tips: '萬子・筒子・索子のいずれか1種類だけで手札を作る役です。高得点の役です。',
        exampleTiles: ['1m', '1m', '2m', '3m', '4m', '4m', '5m', '5m', '6m', '7m', '7m', '8m', '9m'],
        winningTile: '6m',
        highlightStart: 0,
        highlightEnd: 13
      },
      '国士無双': {
        reading: 'コクシムソウ',
        points: '13ポイント',
        tips: '1・9の数牌と字牌（全13種類）を1枚ずつ揃え、どれか1種類を2枚にする役満です。',
        exampleTiles: ['1m', '9m', '1p', '9p', '1s', '9s', '東', '南', '西', '北', '白', '白', '發'],
        winningTile: '中',
        highlightStart: 0,
        highlightEnd: 13
      },
      '四暗刻': {
        reading: 'スーアンコー',
        points: '13ポイント',
        tips: '同じ牌3枚の刻子を4組作る役満です。すべて自分で引いた牌で作る必要があります。',
        exampleTiles: ['2m', '2m', '2m', '5m', '5m', '5m', '4s', '4s', '4s', '9p', '9p', '9p', '發'],
        winningTile: '發',
        highlightStart: 0,
        highlightEnd: 12
      },
      '字一色': {
        reading: 'ツーイーソー',
        points: '13ポイント',
        tips: '字牌（東・南・西・北・白・發・中）だけで手札を作る役満です。数牌は一切使えません。',
        exampleTiles: ['東', '東', '東', '南', '南', '南', '北', '北', '北', '發', '發', '中', '中'],
        winningTile: '中',
        highlightStart: 0,
        highlightEnd: 13
      },
      '大三元': {
        reading: 'ダイサンゲン',
        points: '13ポイント',
        tips: '白・發・中の三元牌すべてを刻子にする役満です。非常に難しい役です。',
        exampleTiles: ['白', '白', '白', '發', '發', '發', '中', '中', '中', '2s', '3s', '8s', '8s'],
        winningTile: '1s',
        highlightStart: 0,
        highlightEnd: 9
      },
      '小四喜': {
        reading: 'ショウスーシー',
        points: '13ポイント',
        tips: '東・南・西・北の風牌のうち、3種類を刻子、1種類を対子にする役満です。',
        exampleTiles: ['4s', '5s', '6s', '東', '東', '東', '南', '南', '南', '西', '西', '北', '北'],
        winningTile: '西',
        highlightStart: 3,
        highlightEnd: 13
      },
      '大四喜': {
        reading: 'ダイスーシー',
        points: '13ポイント',
        tips: '東・南・西・北の風牌すべてを刻子にする役満です。最も難しい役の一つです。',
        exampleTiles: ['東', '東', '東', '南', '南', '南', '西', '西', '西', '北', '北', '北', '8p'],
        winningTile: '8p',
        highlightStart: 0,
        highlightEnd: 12
      },
      '清老頭': {
        reading: 'チンロートー',
        points: '13ポイント',
        tips: '1と9の数牌だけで手札を作る役満です。字牌は使えません。',
        exampleTiles: ['1m', '1m', '1m', '9m', '9m', '9m', '1p', '1p', '1p', '9p', '9p', '9s', '9s'],
        winningTile: '9s',
        highlightStart: 0,
        highlightEnd: 13
      },
      '緑一色': {
        reading: 'リューイーソー',
        points: '13ポイント',
        tips: '緑色の牌（2・3・4・6・8の索子と發）だけで手札を作る役満です。',
        exampleTiles: ['2s', '2s', '3s', '3s', '4s', '4s', '6s', '6s', '6s', '8s', '8s', '發', '發'],
        winningTile: '8s',
        highlightStart: 0,
        highlightEnd: 13
      },
    };

    // 混一色、清一色、一気通貫、九蓮宝燈、純正九蓮宝燈は括弧内の色を除去してマッチング
    const baseYakuName = yakuName.replace(/（[^）]+）/g, '');

    if (baseYakuName === '清一色') {
      const suitMatch = yakuName.match(/（(萬子|筒子|索子)）/);
      const suitName = suitMatch ? suitMatch[1] : '1種類の数牌';
      const suit = suitMatch && suitMatch[1] === '萬子' ? 'm' : suitMatch && suitMatch[1] === '筒子' ? 'p' : 's';
      return {
        reading: 'チンイーソー',
        points: '6ポイント',
        tips: `${suitName}だけで手札を作る役です。他の色の数牌や字牌は使えません。高得点の役です。`,
        exampleTiles: [`1${suit}`, `1${suit}`, `2${suit}`, `3${suit}`, `4${suit}`, `4${suit}`, `5${suit}`, `5${suit}`, `6${suit}`, `7${suit}`, `7${suit}`, `8${suit}`, `9${suit}`],
        winningTile: `6${suit}`,
        highlightStart: 0,
        highlightEnd: 13
      };
    }

    if (baseYakuName === '混一色') {
      const suitMatch = yakuName.match(/（(萬子|筒子|索子)）/);
      const suitName = suitMatch ? suitMatch[1] : '1種類の数牌';
      const suit = suitMatch && suitMatch[1] === '萬子' ? 'm' : suitMatch && suitMatch[1] === '筒子' ? 'p' : 's';
      return {
        reading: 'ホンイーソー',
        points: '3ポイント',
        tips: `${suitName}と字牌だけで手札を作る役です。他の色の数牌は使えません。`,
        exampleTiles: [`1${suit}`, `2${suit}`, `3${suit}`, `4${suit}`, `4${suit}`, `4${suit}`, `7${suit}`, `8${suit}`, `9${suit}`, '南', '南', '北', '北'],
        winningTile: '北',
        highlightStart: 0,
        highlightEnd: 13
      };
    }

    if (baseYakuName === '一気通貫') {
      const suitMatch = yakuName.match(/（(萬子|筒子|索子)）/);
      const suitName = suitMatch ? suitMatch[1] : '同じ色';
      const suit = suitMatch && suitMatch[1] === '萬子' ? 'm' : suitMatch && suitMatch[1] === '筒子' ? 'p' : 's';
      return {
        reading: 'イッキツウカン',
        points: '2ポイント',
        tips: `${suitName}で1-2-3、4-5-6、7-8-9の順子を作る役です。同じ色で1から9まで揃えます。`,
        exampleTiles: [`1${suit}`, `2${suit}`, `3${suit}`, `4${suit}`, `5${suit}`, `6${suit}`, `7${suit}`, `8${suit}`, `9${suit}`, '6p', '7p', '東', '東'],
        winningTile: '5p',
        highlightStart: 0,
        highlightEnd: 9
      };
    }

    if (baseYakuName === '九蓮宝燈') {
      const suitMatch = yakuName.match(/（(萬子|筒子|索子)）/);
      const suitName = suitMatch ? suitMatch[1] : '1種類の数牌';
      const suit = suitMatch && suitMatch[1] === '萬子' ? 'm' : suitMatch && suitMatch[1] === '筒子' ? 'p' : 's';
      return {
        reading: 'チューレンポートー',
        points: '13ポイント',
        tips: `${suitName}で1112345678999の形を作る役満です。最も美しい役と言われています。`,
        exampleTiles: [`1${suit}`, `1${suit}`, `2${suit}`, `3${suit}`, `4${suit}`, `5${suit}`, `6${suit}`, `7${suit}`, `8${suit}`, `8${suit}`, `9${suit}`, `9${suit}`, `9${suit}`],
        winningTile: `1${suit}`,
        highlightStart: 0,
        highlightEnd: 13
      };
    }

    if (baseYakuName === '純正九蓮宝燈') {
      const suitMatch = yakuName.match(/（(萬子|筒子|索子)）/);
      const suitName = suitMatch ? suitMatch[1] : '1種類の数牌';
      const suit = suitMatch && suitMatch[1] === '萬子' ? 'm' : suitMatch && suitMatch[1] === '筒子' ? 'p' : 's';
      return {
        reading: 'ジュンセイチューレンポートー',
        points: '13ポイント',
        tips: `${suitName}で1112345678999の形を作り、さらに1か9が4枚ある役満です。九蓮宝燈の最高形です。`,
        exampleTiles: [`1${suit}`, `1${suit}`, `1${suit}`, `2${suit}`, `3${suit}`, `4${suit}`, `5${suit}`, `6${suit}`, `7${suit}`, `8${suit}`, `9${suit}`, `9${suit}`, `9${suit}`],
        winningTile: `5${suit}`,
        highlightStart: 0,
        highlightEnd: 13
      };
    }

    return yakuDetails[yakuName] || {
      reading: '',
      points: '1ポイント',
      tips: '（後で内容を追加）',
      exampleTiles: []
    };
  };

  // 捨て牌履歴を表示するヘルパー関数（MahjongGridスタイル）
  const renderDiscardHistory = (discards: Tile[]) => {
    if (discards.length === 0) {
      return <div className="text-mahjong-gold-300 text-center font-japanese font-semibold text-lg">まだ捨て牌がありません</div>;
    }

    return (
      <div className="grid grid-cols-6 gap-2 justify-items-center">
        {discards.map((tile, index) => (
          <div key={`discard-${tile.id}-${index}`}>
            <MahjongTile
              tile={tile}
              selected={false}
              index={index}
              priority={false}
            />
          </div>
        ))}
      </div>
    );
  };

  // タッチ対応のためのスワイプ防止
  useEffect(() => {
    const preventSwipe = (e: TouchEvent) => {
      if (activeTile) {
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch (error) {
          // イベントがキャンセルできない場合は無視
          console.debug('Could not prevent touch event:', error);
        }
        return false;
      }
    };

    const preventSwipeMove = (e: TouchEvent) => {
      if (activeTile) {
        try {
          e.preventDefault();
          e.stopPropagation();
        } catch (error) {
          // touchmoveイベントは特にキャンセルできない場合が多い
          console.debug('Could not prevent touchmove event:', error);
        }
        return false;
      }
    };

    const options = { passive: false, capture: true };
    const moveOptions = { passive: false, capture: true }; // touchmoveもpassive: falseに変更

    document.addEventListener('touchstart', preventSwipe, options);
    document.addEventListener('touchmove', preventSwipeMove, moveOptions);
    document.addEventListener('touchend', preventSwipe, options);

    // コンテキストメニューも防止
    document.addEventListener('contextmenu', (e) => {
      if (activeTile) {
        e.preventDefault();
      }
    });

    return () => {
      document.removeEventListener('touchstart', preventSwipe, options);
      document.removeEventListener('touchmove', preventSwipeMove, moveOptions);
      document.removeEventListener('touchend', preventSwipe, options);
      document.removeEventListener('contextmenu', (e) => {
        if (activeTile) {
          e.preventDefault();
        }
      });
    };
  }, [activeTile]);

  // 選択フェーズの開始時に配牌ポップアップを表示
  useEffect(() => {
    if (gamePhase === 'selecting' && !hasDealt) {
      setShowDealPopup(true);
    }
  }, [gamePhase, hasDealt]);

  // 配牌処理
  const handleDeal = () => {
    setShowDealPopup(false);
    dealTiles();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTile = [...handTiles, ...poolTiles].find(tile => tile.id === active.id);
    if (draggedTile) {
      setActiveTile(draggedTile);
      setActiveZone(handTiles.some(t => t.id === active.id) ? "hand" : "pool");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !activeZone) {
      setActiveTile(null);
      setActiveZone(null);
      return;
    }

    // ドロップ先のゾーンを判定
    const targetZone = over.data?.current?.sortable?.containerId || over.id;
    const isTargetTile = over.data?.current?.sortable?.index !== undefined;

    if (targetZone === activeZone && isTargetTile) {
      // 同じゾーン内での並び替え
      const tiles = activeZone === "hand" ? handTiles : poolTiles;
      const oldIndex = tiles.findIndex(t => t.id === active.id);
      const newIndex = tiles.findIndex(t => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderZone(activeZone, oldIndex, newIndex);
      }
    } else if (targetZone !== activeZone) {
      // 異なるゾーン間の移動
      const targetIndex = isTargetTile
        ? (targetZone === "hand" ? handTiles : poolTiles).findIndex(t => t.id === over.id)
        : undefined;
      moveTile(active.id.toString(), activeZone, targetZone as "hand" | "pool", targetIndex);
    }

    setActiveTile(null);
    setActiveZone(null);
  };

  // タイトル画面
  if (gamePhase === 'title') {
    return <TitleScreen onStartGame={startGame} />;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={gameContainerRef}
        className="container mx-auto p-4 relative"
        style={{
          touchAction: 'pan-x pan-y pinch-zoom',
          overscrollBehavior: 'none'
        }}
      >
        {/* 局数表示（左上） */}
        <div className="absolute top-4 left-4 bg-mahjong-gold-500/90  text-white px-6 py-3 rounded-lg shadow-mahjong-button font-japanese font-bold text-2xl border-2 border-mahjong-gold-400">
          第{currentRound}局
        </div>

        {/* スコア表示（真ん中上） */}
        <div className="text-center mb-8">
          <div className="bg-black/30  text-white px-10 py-6 rounded-2xl shadow-mahjong-button font-japanese font-bold text-3xl border-2 border-mahjong-gold-400/50 inline-block">
            <span className="text-mahjong-blue-300">プレイヤー</span>
            <span className="mx-4 text-mahjong-gold-300">{score.player}</span>
            <span className="text-mahjong-gold-400">:</span>
            <span className="mx-4 text-mahjong-gold-300">{score.cpu}</span>
            <span className="text-mahjong-red-300">CPU</span>
          </div>
        </div>

        <div className="space-y-8">
          {error && (
            <div className="bg-mahjong-red-500/90  border-2 border-mahjong-red-400 text-white px-8 py-6 rounded-xl shadow-mahjong-button font-japanese font-semibold text-center text-xl">
              ⚠️ {error}
            </div>
          )}

          {gamePhase === 'selecting' && (
            <>
              {/* 手札選択画面のボタン */}
              <div className="flex justify-center gap-6 mb-8">
                <Button
                  onClick={analyzeTenpai}
                  disabled={!hasDealt || isAnalyzing}
                  variant="mahjong"
                  className="px-8 py-4 bg-gradient-to-r from-mahjong-blue-600 to-mahjong-blue-700 text-white rounded-xl disabled:from-gray-600 disabled:to-gray-700 border-2 border-mahjong-gold-400/50"
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                  }}
                >
                  {isAnalyzing ? '🔍 分析中...' : '💡 AIアシスタント表示'}
                </Button>
              </div>

              <section className="bg-black/20  rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-japanese font-bold text-2xl text-white">手札選択（13枚を選んでください）</h2>
                  <div className="flex gap-3">
                    <Button
                      onClick={reset}
                      disabled={handTiles.length === 0}
                      variant="mahjong"
                      className={`px-6 py-3 rounded-xl font-semibold ${handTiles.length > 0
                        ? 'bg-gradient-to-r from-mahjong-red-600 to-mahjong-red-700 text-white border-2 border-mahjong-red-400/50'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      🔄 リセット
                    </Button>
                    <Button
                      onClick={completeSelection}
                      disabled={handTiles.length !== 13}
                      variant="mahjong"
                      className={`px-6 py-3 rounded-xl font-semibold ${handTiles.length === 13
                        ? 'bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-white border-2 border-mahjong-gold-400/50'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      ✅ 選択完了 ({handTiles.length}/13枚)
                    </Button>
                  </div>
                </div>
                <div className="max-w-full overflow-x-auto">
                  <HandZone
                    tiles={handTiles}
                    onTileDrop={moveTile}
                    onReorder={(fromIdx, toIdx) => reorderZone('hand', fromIdx, toIdx)}
                  />
                </div>
              </section>

              <section className="bg-black/20  rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-japanese font-bold text-2xl text-white">牌プール</h2>
                  <DoraIndicator dora={dora} />
                </div>
                <MahjongGrid
                  tiles={poolTiles}
                  onTileDrop={moveTile}
                  onReorder={(fromIdx, toIdx) => reorderZone('pool', fromIdx, toIdx)}
                  dora={dora}
                />
              </section>
            </>
          )}

          {gamePhase === 'playing' && (
            <>
              {/* 手番表示 */}
              <div className={`p-6 rounded-2xl text-center font-japanese font-bold text-xl shadow-mahjong-button border-2 ${isProcessingWin
                ? 'bg-gradient-to-r from-mahjong-gold-500 to-mahjong-gold-600 text-white border-mahjong-gold-400'
                : isPlayerTurn
                  ? 'bg-gradient-to-r from-mahjong-blue-500 to-mahjong-blue-600 text-white border-mahjong-blue-400'
                  : 'bg-gradient-to-r from-mahjong-red-500 to-mahjong-red-600 text-white border-mahjong-red-400'
                }`}>
                {isProcessingWin ? '🔍 和了判定中...' :
                  isPlayerTurn ? '🎯 あなたの番です' : '🤖 CPUの番です'}
              </div>

              {/* CPU手札 */}
              <section className="bg-black/20  rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <h2 className="mb-4 font-japanese font-bold text-2xl text-white">CPU手札</h2>
                <div className="flex gap-2 justify-center bg-mahjong-ivory-500/20 p-6 rounded-xl border-2 border-mahjong-ivory-400/30">
                  {Array.from({ length: 13 }, (_, i) => (
                    <div
                      key={i}
                      className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22 bg-mahjong-ivory-500 rounded-lg border-2 border-mahjong-ivory-600 shadow-mahjong-tile"
                    />
                  ))}
                </div>
              </section>

              {/* 捨て牌履歴 */}
              <div className="grid grid-cols-2 gap-8">
                <section className="bg-black/20  rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                  <h2 className="mb-4 font-japanese font-bold text-2xl text-mahjong-blue-300">あなたの捨て牌</h2>
                  <div className="bg-mahjong-blue-500/20 p-4 rounded-xl min-h-28 border-2 border-mahjong-blue-400/30">
                    {renderDiscardHistory(playerDiscards)}
                  </div>
                </section>
                <section className="bg-black/20  rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                  <h2 className="mb-4 font-japanese font-bold text-2xl text-mahjong-red-300">CPUの捨て牌</h2>
                  <div className="bg-mahjong-red-500/20 p-4 rounded-xl min-h-28 border-2 border-mahjong-red-400/30">
                    {renderDiscardHistory(cpuDiscards)}
                  </div>
                </section>
              </div>

              {/* プレイヤーの手札 */}
              <section className="bg-black/20  rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-japanese font-bold text-2xl text-mahjong-blue-300">あなたの手札</h2>
                  <DoraIndicator dora={dora} />
                </div>
                <div className="flex gap-2 justify-center bg-mahjong-blue-500/20 p-6 rounded-xl border-2 border-mahjong-blue-400/30">
                  {handTiles.map((tile, index) => (
                    <MahjongTile
                      key={`hand-${tile.id}-${index}`}
                      tile={tile}
                      selected
                      index={index}
                      priority={true}
                    />
                  ))}
                </div>
              </section>

              {/* 選択可能な捨て牌 */}
              <section className="bg-black/20  rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
                <h2 className="mb-4 font-japanese font-bold text-2xl text-white">
                  捨て牌を選択してください（{poolTiles.length}枚）
                  {isProcessingWin ? <span className="text-mahjong-gold-300 ml-2 text-xl">（和了判定中...）</span> :
                    !isPlayerTurn && <span className="text-gray-400 ml-2 text-xl">（CPUの番です）</span>}
                </h2>
                <div className="flex flex-wrap gap-2 justify-center bg-mahjong-gold-500/20 p-6 rounded-xl border-2 border-mahjong-gold-400/30">
                  {poolTiles.map((tile, index) => (
                    <div
                      key={`pool-${tile.id}-${index}`}
                      onClick={() => {
                        if (isPlayerTurn && !isProcessingWin) {
                          discardTile(tile);
                        }
                      }}
                      className={`${isPlayerTurn && !isProcessingWin
                        ? 'cursor-pointer hover:opacity-75 hover:scale-105 transition-all'
                        : 'cursor-not-allowed opacity-50'
                        }`}
                    >
                      <MahjongTile
                        tile={tile}
                        selected={false}
                        index={index}
                        priority={false}
                        isDora={tile.type === dora}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* 和了表示 */}
          {gamePhase === 'finished' && winningInfo && (
            <section className="mt-8">
              <div className={`p-8 rounded-2xl text-center shadow-mahjong-tile-hover border-4 font-japanese ${winningInfo.winner === 'player'
                ? 'bg-gradient-to-br from-mahjong-blue-500 to-mahjong-blue-700 border-mahjong-blue-400'
                : 'bg-gradient-to-br from-mahjong-red-500 to-mahjong-red-700 border-mahjong-red-400'
                }`}>
                <h2 className="text-4xl font-bold mb-6 text-white">
                  {winningInfo.winner === 'player' ? '🎉 あなたの和了！' : '😔 CPUの和了'}
                </h2>

                {/* 勝利判定 */}
                {(score.player >= 5 || score.cpu >= 5) && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-mahjong-gold-500 to-mahjong-gold-600 border-4 border-mahjong-gold-400 rounded-2xl shadow-mahjong-button">
                    <h3 className="text-3xl font-bold text-white mb-2 font-japanese">
                      🏆 ゲーム終了！
                    </h3>
                    <p className="text-xl text-white font-japanese">
                      {score.player >= 5 ? 'プレイヤーの勝利！' : 'CPUの勝利！'}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  {/* ポイント表示 */}
                  <div className="text-3xl font-bold mb-6 text-mahjong-gold-300 font-japanese">
                    {winningInfo.han ? `${winningInfo.han}ポイント` : '1ポイント'}
                  </div>

                  {/* 最終形表示 */}
                  <div className="mb-6">
                    <div className="font-japanese font-bold mb-4 text-white text-xl">最終形：</div>
                    <div className="flex justify-center items-center gap-1 mb-4 bg-mahjong-ivory-500/20 p-4 rounded-xl border-2 border-mahjong-ivory-400/30">
                      {winningInfo.winner === 'player' ?
                        // プレイヤーの最終形（手札 + 和了牌）
                        [...handTiles, { id: 'winning-player', type: winningInfo.winningTile, imagePath: getTileImagePath(winningInfo.winningTile) }].map((tile, index) => (
                          <div key={tile.id || index} className="w-8 h-12">
                            <div className="relative w-full h-full">
                              <Image
                                src={tile.imagePath}
                                alt={tile.type}
                                fill
                                sizes="32px"
                                className="object-contain"
                              />
                            </div>
                          </div>
                        )) :
                        // CPUの最終形（手札 + 和了牌）
                        [...(cpuState?.handTiles || []), { id: 'winning-cpu', type: winningInfo.winningTile, imagePath: getTileImagePath(winningInfo.winningTile) }].map((tile, index) => (
                          <div key={tile.id || index} className="w-8 h-12">
                            <div className="relative w-full h-full">
                              <Image
                                src={tile.imagePath}
                                alt={tile.type}
                                fill
                                sizes="32px"
                                className="object-contain"
                              />
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    <div className="flex items-center justify-center gap-3 text-lg text-mahjong-gold-200 font-japanese font-semibold">
                      <span>和了牌:</span>
                      <div className="relative w-12 h-16 inline-block">
                        <Image
                          src={getTileImagePath(winningInfo.winningTile)}
                          alt={winningInfo.winningTile}
                          fill
                          sizes="48px"
                          className="object-contain"
                          priority={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 成立役表示 */}
                  <div className="mb-6">
                    <div className="font-japanese font-bold mb-4 text-white text-xl">成立した役：</div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {translateYaku(winningInfo.yaku).map((yaku, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-mahjong-gold-500/90 text-white rounded-full text-sm font-japanese font-semibold border-2 border-mahjong-gold-400 shadow-mahjong-tile cursor-pointer hover:bg-mahjong-gold-600/90 hover:border-mahjong-gold-300 hover:scale-105 transition-all"
                          onClick={() => setSelectedYakuForDetail(yaku)}
                        >
                          {yaku}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-6">
                  {score.player >= 5 || score.cpu >= 5 ? (
                    <Button
                      onClick={endGame}
                      variant="mahjong"
                      className="px-8 py-4 bg-gradient-to-r from-mahjong-table-700 to-mahjong-table-800 text-white rounded-xl border-2 border-mahjong-gold-400/50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      🏠 タイトルに戻る
                    </Button>
                  ) : (
                    <Button
                      onClick={nextRound}
                      variant="mahjong"
                      className="px-8 py-4 bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-white rounded-xl border-2 border-mahjong-gold-400/50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      ➡️ 次の局へ
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 流局表示 */}
          {gamePhase === 'draw' && (
            <section className="mt-8">
              <div className="p-8 rounded-2xl text-center bg-gradient-to-br from-mahjong-table-600 to-mahjong-table-700 border-4 border-mahjong-gold-400 shadow-mahjong-tile-hover font-japanese">
                <h2 className="text-4xl font-bold mb-6 text-white">🀄 流局（引き分け）</h2>
                <div className="text-xl mb-8 text-mahjong-gold-200">
                  <div className="mb-6">捨て牌候補が尽きました</div>

                  {/* CPUの手札表示 */}
                  <div className="mb-6">
                    <div className="text-lg font-semibold mb-3 text-white">相手（CPU）の手札</div>
                    <div className="flex justify-center gap-2 flex-wrap mb-6">
                      {cpuState?.handTiles && cpuState.handTiles.map((tile: Tile, index: number) => (
                        <div key={`cpu-hand-${tile.id}-${index}`} className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22">
                          <MahjongTile
                            tile={tile}
                            selected={false}
                            index={index}
                            priority={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CPUのあたり牌表示 */}
                  <div className="mb-6">
                    <div className="text-lg font-semibold mb-3 text-white">相手（CPU）のあたり牌</div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {cpuState?.winningTile && (
                        <div key={`cpu-winning-${cpuState.winningTile.id}`} className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22">
                          <MahjongTile
                            tile={cpuState.winningTile}
                            selected={false}
                            index={0}
                            priority={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-lg text-mahjong-gold-300 mt-6 font-semibold">
                    ポイントは加算されません
                  </div>
                </div>
                <div className="flex justify-center gap-6">
                  {score.player >= 5 || score.cpu >= 5 ? (
                    <Button
                      onClick={endGame}
                      variant="mahjong"
                      className="px-8 py-4 bg-gradient-to-r from-mahjong-table-700 to-mahjong-table-800 text-white rounded-xl border-2 border-mahjong-gold-400/50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      🏠 タイトルに戻る
                    </Button>
                  ) : (
                    <Button
                      onClick={nextRound}
                      variant="mahjong"
                      className="px-8 py-4 bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-white rounded-xl border-2 border-mahjong-gold-400/50"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      }}
                    >
                      ➡️ 次の局へ
                    </Button>
                  )}
                </div>
              </div>
            </section>
          )}

          {suggestions && suggestions.length > 0 && gamePhase === 'selecting' && (
            <section className="mt-8">
              <h2 className="text-4xl font-bold mb-8 text-white font-japanese text-center">AIアシスタント提案</h2>
              <div className="space-y-8">

                {/* 役の分析結果の表示 */}
                {suggestions.length > 0 && suggestions[0].yakuAnalysis && suggestions[0].yakuAnalysis.length > 0 && (
                  <div>
                    <div className="flex items-center justify-center mb-6">
                      <h3 className="text-3xl font-japanese font-bold text-mahjong-gold-300 text-center">
                        作れる可能性がある役
                      </h3>
                      <Button
                        onClick={() => setIsYakuHintOpen(true)}
                        variant="outline"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 ml-4"
                        size="sm"
                      >
                        💡 役とは？
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {suggestions[0].yakuAnalysis.map((yaku: any, yakuIndex: number) => (
                        <div
                          key={yakuIndex}
                          className="bg-black/30 p-6 rounded-xl shadow-mahjong-tile border-2 border-mahjong-gold-400/30 cursor-pointer hover:border-mahjong-gold-400/60 hover:bg-black/40 transition-all"
                          onClick={() => setSelectedYakuForDetail(yaku.yakuName)}
                        >
                          {/* ヘッダー: 役名とポイント */}
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-japanese font-bold text-mahjong-gold-300 flex items-center gap-2">
                              <span>{yakuIndex === 0 ? '①' : yakuIndex === 1 ? '②' : yakuIndex === 2 ? '③' : yakuIndex === 3 ? '④' : yakuIndex === 4 ? '⑤' : `${yakuIndex + 1}.`}</span>
                              {renderYakuName(yaku.yakuName)}
                            </h3>
                            <span className={`text-xl font-bold ${yaku.han === 1 ? 'text-white' :
                              yaku.han === 2 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                              {yaku.han}ポイント
                            </span>
                          </div>

                          {/* 一言説明 */}
                          {yaku.summary && (
                            <div className="mb-4">
                              <p className="text-lg font-semibold text-white">
                                {yaku.summary}
                              </p>
                            </div>
                          )}

                          {/* 牌画像表示 */}
                          {yaku.exampleTiles && yaku.exampleTiles.length > 0 && (
                            <div className="flex gap-2 justify-center mt-4 flex-wrap">
                              {yaku.exampleTiles.map((tileCode: string, idx: number) => (
                                <div key={idx} className="relative w-10 h-14">
                                  <Image
                                    src={getTileImagePath(tileCode)}
                                    alt={tileCode}
                                    fill
                                    sizes="40px"
                                    className="object-contain"
                                    priority={false}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 従来の説明文（フォールバック） */}
                          {!yaku.summary && yaku.description && (
                            <div className="text-mahjong-ivory-200 leading-relaxed text-base">
                              {yaku.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 事前計算された面子情報の表示（一か所だけ） */}
                {suggestions.length > 0 && suggestions[0].melds && (
                  <div className="mt-8">
                    <div className="flex flex-wrap justify-center gap-6">
                      {/* 順子 */}
                      {suggestions[0].melds.sequences.length > 0 && (
                        <div className="bg-mahjong-table-500/20 p-6 rounded-xl border-4 border-mahjong-table-400/50 min-w-[320px] max-w-[500px]">
                          <p className="text-lg text-mahjong-gold-300 font-semibold mb-4 text-center">3枚セット（順番） ({suggestions[0].melds.sequences.length}種類)</p>
                          <div className="flex flex-wrap gap-3 justify-center">
                            {suggestions[0].melds.sequences.map((sequence: string[], idx: number) => (
                              <div key={idx} className="flex gap-1.5">
                                {sequence.map((tile: string, tileIdx: number) => (
                                  <div key={tileIdx} className="inline-flex w-12 h-16">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={getTileImagePath(tile)}
                                        alt={tile}
                                        fill
                                        sizes="48px"
                                        className="object-contain"
                                        priority={false}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 刻子 */}
                      {suggestions[0].melds.triplets.length > 0 && (
                        <div className="bg-mahjong-table-500/20 p-6 rounded-xl border-4 border-mahjong-table-400/50 min-w-[320px] max-w-[500px]">
                          <p className="text-lg text-mahjong-gold-300 font-semibold mb-4 text-center">3枚セット（同じ牌） ({suggestions[0].melds.triplets.length}種類)</p>
                          <div className="flex flex-wrap gap-3 justify-center">
                            {suggestions[0].melds.triplets.map((triplet: string[], idx: number) => (
                              <div key={idx} className="flex gap-1.5">
                                {triplet.map((tile: string, tileIdx: number) => (
                                  <div key={tileIdx} className="inline-flex w-12 h-16">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={getTileImagePath(tile)}
                                        alt={tile}
                                        fill
                                        sizes="48px"
                                        className="object-contain"
                                        priority={false}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 対子 */}
                      {suggestions[0].melds.pairs.length > 0 && (
                        <div className="bg-mahjong-table-500/20 p-6 rounded-xl border-4 border-mahjong-table-400/50 min-w-[320px] max-w-[500px]">
                          <p className="text-lg text-mahjong-gold-300 font-semibold mb-4 text-center">2枚ペア ({suggestions[0].melds.pairs.length}種類)</p>
                          <div className="flex flex-wrap gap-3 justify-center">
                            {suggestions[0].melds.pairs.map((pair: string[], idx: number) => (
                              <div key={idx} className="flex gap-1.5">
                                {pair.map((tile: string, tileIdx: number) => (
                                  <div key={tileIdx} className="inline-flex w-12 h-16">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={getTileImagePath(tile)}
                                        alt={tile}
                                        fill
                                        sizes="48px"
                                        className="object-contain"
                                        priority={false}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 塔子（ターツ） */}
                      {suggestions[0].melds.taatsu.length > 0 && (
                        <div className="bg-mahjong-table-500/20 p-6 rounded-xl border-4 border-mahjong-table-400/50 min-w-[320px] max-w-[500px]">
                          <p className="text-lg text-mahjong-gold-300 font-semibold mb-4 text-center">2枚セット（待ち） ({suggestions[0].melds.taatsu.length}種類)</p>
                          <div className="flex flex-wrap gap-3 justify-center">
                            {suggestions[0].melds.taatsu.map((taatsu: string[], idx: number) => (
                              <div key={idx} className="flex gap-1.5">
                                {taatsu.map((tile: string, tileIdx: number) => (
                                  <div key={tileIdx} className="inline-flex w-12 h-16">
                                    <div className="relative w-full h-full">
                                      <Image
                                        src={getTileImagePath(tile)}
                                        alt={tile}
                                        fill
                                        sizes="48px"
                                        className="object-contain border-2 border-blue-400 rounded"
                                        priority={false}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <DragOverlay>
          {activeTile ? <MahjongTile tile={activeTile} selected={activeZone === "hand"} index={0} /> : null}
        </DragOverlay>
      </div>

      {/* 役のヒントポップアップ */}
      <HintPopup
        isOpen={isYakuHintOpen}
        onClose={() => setIsYakuHintOpen(false)}
        title="🀄 役（やく）とは？"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3">
              📋 役の基本
            </h3>
            <p className="text-lg sm:text-xl leading-relaxed text-gray-700">
              <span className="font-bold text-blue-600">役（やく）</span>とは、麻雀で上がるために必要な<span className="font-bold">特定の牌の組み合わせパターン</span>のことです。
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
            <h4 className="text-lg sm:text-xl font-bold text-green-800 mb-3">
              ✅ このゲームでは
            </h4>
            <div className="space-y-3 text-base sm:text-lg text-gray-700">
              <p>
                <span className="font-bold text-green-600">「リーチ（1ポイント）」という役が自動でつきます</span>ので、<br />
                <span className="font-bold text-blue-600">役がなくても上がれます！</span>
              </p>
              <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-green-300">
                💡 通常の麻雀では役が必須ですが、このゲームは初心者向けに簡単にしています
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
            <h4 className="text-lg sm:text-xl font-bold text-yellow-800 mb-3">
              💡 役を作るメリット
            </h4>
            <div className="space-y-3 text-base sm:text-lg text-gray-700">
              <p>
                <span className="font-bold text-yellow-700">①</span> 役を作ると<span className="font-bold text-green-600">得点がアップ</span>します
              </p>
              <p>
                <span className="font-bold text-yellow-700">②</span> 難しい役ほど<span className="font-bold">高得点</span>
              </p>
              <p>
                <span className="font-bold text-yellow-700">③</span> <span className="font-bold text-green-600">複数の役を同時に作る</span>ことで、さらに高得点に
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <p className="text-base sm:text-lg text-gray-600">
              💡 AIアシスタントが「作れる可能性がある役」を提案してくれるので、それを参考に手札を選びましょう！
            </p>
          </div>
        </div>
      </HintPopup>

      {/* 役の詳細ヒントポップアップ */}
      {selectedYakuForDetail && (() => {
        const suitMatch = selectedYakuForDetail.match(/（(萬子|筒子|索子)）/);
        const baseName = selectedYakuForDetail.replace(/（[^）]+）/g, '');
        const suit = suitMatch ? suitMatch[1] : null;
        const tileCode = suit === '萬子' ? '1m' : suit === '筒子' ? '1p' : suit === '索子' ? '1s' : null;

        const titleContent = suit && tileCode ? (
          <div className="flex items-center gap-2">
            <span>🀄 {baseName}</span>
            <div className="relative w-10 h-14 inline-block">
              <Image
                src={getTileImagePath(tileCode)}
                alt={suit}
                fill
                sizes="40px"
                className="object-contain"
                priority={false}
              />
            </div>
            <span>（{getYakuDetail(selectedYakuForDetail).reading}）</span>
          </div>
        ) : (
          `🀄 ${selectedYakuForDetail}（${getYakuDetail(selectedYakuForDetail).reading}）`
        );

        const headerContent = suit && tileCode ? (
          <span className="flex items-center gap-2">
            <span>{baseName}</span>
            <div className="relative w-8 h-12 inline-block">
              <Image
                src={getTileImagePath(tileCode)}
                alt={suit}
                fill
                sizes="32px"
                className="object-contain"
                priority={false}
              />
            </div>
            <span>について</span>
          </span>
        ) : (
          `${selectedYakuForDetail}について`
        );

        return (
          <HintPopup
            isOpen={!!selectedYakuForDetail}
            onClose={() => setSelectedYakuForDetail(null)}
            title={titleContent}
          >
            <div className="space-y-6">
              {/* 役の説明 */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-lg sm:text-xl leading-relaxed text-gray-700">
                  {getYakuDetail(selectedYakuForDetail).tips}
                </p>
              </div>

              {/* 実際の例（牌画像） */}
              {getYakuDetail(selectedYakuForDetail).exampleTiles.length > 0 && (() => {
                const detail = getYakuDetail(selectedYakuForDetail);
                return (
                  <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <h4 className="text-lg sm:text-xl font-bold text-green-800 mb-3">
                      🎯 実際の例
                    </h4>
                    <div className="flex gap-3 justify-center flex-wrap items-center">
                      {/* 13枚の手札 */}
                      {detail.exampleTiles.map((tileCode: string, idx: number) => (
                        <div
                          key={idx}
                          className={`relative w-14 h-18 ${idx >= (detail.highlightStart || 0) && idx < (detail.highlightEnd || 0) ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                        >
                          <Image
                            src={getTileImagePath(tileCode)}
                            alt={tileCode}
                            fill
                            sizes="56px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>
                      ))}

                      {/* 区切り */}
                      {detail.winningTile && (
                        <>
                          <span className="text-2xl font-bold text-gray-600 mx-2">+</span>

                          {/* 14枚目（上がり牌） */}
                          <div className="relative w-14 h-18 ring-4 ring-green-500 rounded-lg">
                            <Image
                              src={getTileImagePath(detail.winningTile.split('または')[0])}
                              alt={detail.winningTile}
                              fill
                              sizes="56px"
                              className="object-contain"
                              priority={false}
                            />
                          </div>

                          {/* 複数の上がり牌がある場合 */}
                          {detail.winningTile.includes('または') && (
                            <>
                              <span className="text-lg font-bold text-gray-600">または</span>
                              <div className="relative w-14 h-18 ring-4 ring-green-500 rounded-lg">
                                <Image
                                  src={getTileImagePath(detail.winningTile.split('または')[1])}
                                  alt={detail.winningTile}
                                  fill
                                  sizes="56px"
                                  className="object-contain"
                                  priority={false}
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-600">
                        <span className="inline-block w-4 h-4 bg-yellow-400 rounded mr-2"></span>
                        役を成り立たせている部分
                        <span className="inline-block w-4 h-4 bg-green-500 rounded ml-4 mr-2"></span>
                        上がり牌
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </HintPopup>
        );
      })()}

      {/* 配牌ポップアップ */}
      {showDealPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-in fade-in duration-200"
          onClick={handleDeal}
        >
          <div className="flex flex-col items-center gap-8">
            <Button
              onClick={handleDeal}
              variant="mahjong"
              className="px-16 py-8 text-4xl font-bold bg-gradient-to-r from-mahjong-table-600 to-mahjong-table-700 text-white rounded-2xl border-4 border-mahjong-gold-400 shadow-2xl hover:scale-110 transition-all"
            >
              🎲 配牌する
            </Button>
            <p className="text-white text-xl font-japanese">
              クリックして34枚を配ります
            </p>
          </div>
        </div>
      )}
    </DndContext>
  );
} 