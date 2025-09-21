'use client';

import { useState } from 'react';
import { dealMahjong, getTileImagePath, shuffle } from '@/lib/mahjong';
import { GameState, MahjongGameHook, PlayerState, Tile, WinningCheckResponse } from '@/types';

// ユニークID生成
let tileIdCounter = 0;
function nextTileId(): string {
  return `tile-${tileIdCounter++}`;
}

// 牌をTile型に変換
function convertToTiles(types: string[]): Tile[] {
  return types.map(type => ({
    id: nextTileId(),
    type,
    imagePath: getTileImagePath(type)
  }));
}

// 初期状態
const initialState: GameState = {
  player: {
    tiles: [],
    discards: [],
    points: 0
  },
  cpu: {
    tiles: [],
    discards: [],
    points: 0
  },
  dora: '1m',
  phase: 'initial',
  turn: 'player',
  lastDiscard: null,
  winner: null
};

export function useMahjongGame(): MahjongGameHook {
  // 状態管理
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ゲーム開始
  const startGame = () => {
    setError(null);
    setMessage('ゲームを開始します');

    const { player1: p1Tiles, player2: p2Tiles, dora } = dealMahjong();

    // プレイヤーには34枚全て、CPUは自動的に13枚を選択
    const playerTiles = convertToTiles(p1Tiles);
    const cpuTiles = convertToTiles(p2Tiles);
    const shuffledCpuTiles = shuffle([...cpuTiles]);
    const cpuSelectedTiles = shuffledCpuTiles.slice(0, 13);

    setGameState({
      ...initialState,
      player: {
        ...initialState.player,
        tiles: playerTiles
      },
      cpu: {
        ...initialState.cpu,
        tiles: cpuSelectedTiles
      },
      dora,
      phase: 'dealing'
    });
  };

  // ゲームリセット
  const resetGame = () => {
    setGameState(initialState);
    setMessage(null);
    setError(null);
    setIsLoading(false);
  };

  // 配牌時の牌選択（プレイヤーのみ）
  const selectTile = (tile: Tile) => {
    if (gameState.phase !== 'dealing') return;

    const currentTiles = gameState.player.tiles;
    if (currentTiles.length === 13) {
      setError('これ以上牌を選択できません');
      return;
    }

    // 選択された牌を手牌に追加
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        tiles: [...prev.player.tiles, tile]
      }
    }));

    // 13枚選択完了したら対局フェーズへ
    if (currentTiles.length === 12) {
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        turn: 'player'
      }));
      setMessage('対局開始！ あなたの番です');
    }
  };

  // 牌を捨てる
  const discardTile = async (tile: Tile) => {
    if (gameState.phase !== 'playing' || gameState.turn !== 'player') return;
    setIsLoading(true);
    setError(null);

    try {
      // プレイヤーの捨て牌を記録
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          tiles: prev.player.tiles.filter(t => t.id !== tile.id),
          discards: [...prev.player.discards, tile]
        },
        lastDiscard: {
          tile,
          from: 'player'
        },
        turn: 'cpu'
      }));

      // CPUの和了判定（ランダム）
      const isCpuWin = Math.random() < 0.2;
      if (isCpuWin) {
        // CPUの勝利
        const points = Math.floor(Math.random() * 5) + 1;
        setGameState(prev => ({
          ...prev,
          phase: 'finished',
          winner: {
            who: 'cpu',
            points,
            yaku: ['ランダム和了']
          }
        }));
        setMessage(`CPUの和了！ ${points}点の和了です`);
        return;
      }

      // CPUの打牌
      await new Promise(resolve => setTimeout(resolve, 1000));
      const cpuTiles = gameState.cpu.tiles;
      const discardIndex = Math.floor(Math.random() * cpuTiles.length);
      const cpuDiscard = cpuTiles[discardIndex];

      setGameState(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          tiles: prev.cpu.tiles.filter(t => t.id !== cpuDiscard.id),
          discards: [...prev.cpu.discards, cpuDiscard]
        },
        lastDiscard: {
          tile: cpuDiscard,
          from: 'cpu'
        },
        turn: 'player'
      }));
      setMessage('あなたの番です');

    } catch (err) {
      setError('エラーが発生しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    gameState,
    startGame,
    resetGame,
    selectTile,
    discardTile,
    message,
    isLoading,
    error
  };
}

