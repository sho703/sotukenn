'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 麻雀牌の型定義
interface Tile {
  id: string;
  type: string;
  imagePath: string;
}

// ブロックの型定義
interface Block {
  id: string;
  name: string;
  tiles: Tile[];
  maxTiles: number;
  color: string;
  description: string;
}

export default function TestBlocksPage() {
  const [mode, setMode] = useState<'five-blocks' | 'seven-pairs'>('five-blocks');
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);

  // 5ブロック理論用の設定
  const fiveBlocksConfig: Block[] = [
    {
      id: 'block1',
      name: 'ブロック1',
      tiles: [],
      maxTiles: 3,
      color: 'border-white border-2',
      description: '順子または刻子'
    },
    {
      id: 'block2',
      name: 'ブロック2',
      tiles: [],
      maxTiles: 3,
      color: 'border-white border-2',
      description: '順子または刻子'
    },
    {
      id: 'block3',
      name: 'ブロック3',
      tiles: [],
      maxTiles: 3,
      color: 'border-white border-2',
      description: '順子または刻子'
    },
    {
      id: 'janto',
      name: '雀頭',
      tiles: [],
      maxTiles: 2,
      color: 'border-white border-2',
      description: '同じ牌のペア'
    },
    {
      id: 'block4',
      name: 'ブロック4',
      tiles: [],
      maxTiles: 2,
      color: 'border-white border-2',
      description: '順子または刻子'
    },
  ];

  // 七対子用の設定
  const sevenPairsConfig: Block[] = [
    {
      id: 'pair1',
      name: '対子1',
      tiles: [],
      maxTiles: 2,
      color: 'border-white border-2',
      description: '同じ牌のペア'
    },
    {
      id: 'pair2',
      name: '対子2',
      tiles: [],
      maxTiles: 2,
      color: 'border-white border-2',
      description: '同じ牌のペア'
    },
    {
      id: 'pair3',
      name: '対子3',
      tiles: [],
      maxTiles: 2,
      color: 'border-white border-2',
      description: '同じ牌のペア'
    },
    {
      id: 'pair4',
      name: '対子4',
      tiles: [],
      maxTiles: 2,
      color: 'border-white border-2',
      description: '同じ牌のペア'
    },
    {
      id: 'pair5',
      name: '対子5',
      tiles: [],
      maxTiles: 2,
      color: 'border-white border-2',
      description: '同じ牌のペア'
    },
    {
      id: 'pair6',
      name: '対子6',
      tiles: [],
      maxTiles: 2,
      color: 'border-white border-2',
      description: '同じ牌のペア'
    },
    {
      id: 'single',
      name: '単騎',
      tiles: [],
      maxTiles: 1,
      color: 'border-white border-2',
      description: '待ち牌'
    },
  ];

  const [blocks, setBlocks] = useState<Block[]>(fiveBlocksConfig);

  // モード切り替え関数
  const switchMode = (newMode: 'five-blocks' | 'seven-pairs') => {
    setMode(newMode);
    setBlocks(newMode === 'five-blocks' ? fiveBlocksConfig : sevenPairsConfig);
    setSelectedTiles([]);
  };

  // サンプル牌データ
  const sampleTiles: Tile[] = [
    { id: '1m', type: '1m', imagePath: '/images/tiles/1man.gif' },
    { id: '2m', type: '2m', imagePath: '/images/tiles/2man.gif' },
    { id: '3m', type: '3m', imagePath: '/images/tiles/3man.gif' },
    { id: '4m', type: '4m', imagePath: '/images/tiles/4man.gif' },
    { id: '5m', type: '5m', imagePath: '/images/tiles/5man.gif' },
    { id: '6m', type: '6m', imagePath: '/images/tiles/6man.gif' },
    { id: '7m', type: '7m', imagePath: '/images/tiles/7man.gif' },
    { id: '8m', type: '8m', imagePath: '/images/tiles/8man.gif' },
    { id: '9m', type: '9m', imagePath: '/images/tiles/9man.gif' },
    { id: '1p', type: '1p', imagePath: '/images/tiles/1pin.gif' },
    { id: '2p', type: '2p', imagePath: '/images/tiles/2pin.gif' },
    { id: '3p', type: '3p', imagePath: '/images/tiles/3pin.gif' },
    { id: 'ton', type: 'ton', imagePath: '/images/tiles/ton.gif' },
    { id: 'nan', type: 'nan', imagePath: '/images/tiles/nan.gif' },
  ];

  const handleTileSelect = (tile: Tile) => {
    if (getTotalTiles() < 13) {
      // 最初の空いているブロックに自動配置
      const emptyBlock = blocks.find(block => block.tiles.length < block.maxTiles);
      if (emptyBlock) {
        setBlocks(blocks.map(b =>
          b.id === emptyBlock.id
            ? { ...b, tiles: [...b.tiles, tile] }
            : b
        ));
      } else {
        setSelectedTiles([...selectedTiles, tile]);
      }
    }
  };

  const handleTileRemove = (tileId: string) => {
    setSelectedTiles(selectedTiles.filter(t => t.id !== tileId));
  };

  const handleBlockDrop = (blockId: string, tile: Tile) => {
    const block = blocks.find(b => b.id === blockId);
    if (block && block.tiles.length < block.maxTiles) {
      setBlocks(blocks.map(b =>
        b.id === blockId
          ? { ...b, tiles: [...b.tiles, tile] }
          : b
      ));
      handleTileRemove(tile.id);
    }
  };

  const handleBlockTileRemove = (blockId: string, tileIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      const removedTile = block.tiles[tileIndex];
      setBlocks(blocks.map(b =>
        b.id === blockId
          ? { ...b, tiles: b.tiles.filter((_, index) => index !== tileIndex) }
          : b
      ));
      setSelectedTiles([...selectedTiles, removedTile]);
    }
  };

  const resetBlocks = () => {
    setBlocks(blocks.map(b => ({ ...b, tiles: [] })));
    setSelectedTiles([]);
  };

  const getTotalTiles = () => {
    return blocks.reduce((total, block) => total + block.tiles.length, 0);
  };

  const getRemainingTiles = () => {
    return selectedTiles.filter(tile =>
      !blocks.some(block => block.tiles.some(blockTile => blockTile.id === tile.id))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white font-japanese">
            {mode === 'five-blocks' ? '5ブロック理論' : '七対子'} - 手牌内仕切り版
          </h1>
          <Link href="/">
            <Button variant="mahjong">
              ← メインゲームに戻る
            </Button>
          </Link>
        </div>


        {/* 説明 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-japanese text-center">
            {mode === 'five-blocks' ? '5ブロック理論とは？' : '七対子とは？'}
          </h2>
          <p className="text-white text-lg text-center">
            {mode === 'five-blocks'
              ? '和了牌が完成するのに必要な「雀頭1組」と「メンツ4組」の合計5つのまとまり（ブロック）を目指す手組みの考え方です。'
              : '7つの対子（同じ牌のペア）で和了する特殊な役です。6つの対子と1枚の単騎待ちで構成されます。'
            }
          </p>
        </div>

        {/* 牌プール */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-japanese">牌プール（13枚を選んでください）</h2>
          <div className="grid grid-cols-7 gap-2">
            {sampleTiles.map((tile) => (
              <div
                key={tile.id}
                onClick={() => handleTileSelect(tile)}
                className="w-12 h-16 bg-mahjong-ivory-500 rounded-lg border-2 border-mahjong-ivory-600 shadow-mahjong-tile cursor-pointer hover:scale-105 transition-transform flex items-center justify-center text-sm font-bold"
              >
                {tile.type}
              </div>
            ))}
          </div>
        </div>

        {/* 選択された手牌（ブロック仕切り付き） */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white font-japanese">
              選択された手牌 ({getTotalTiles()}/13) - {mode === 'five-blocks' ? '5ブロック理論' : '七対子'}
            </h2>

            {/* モード切り替えボタン */}
            <div className="flex gap-2">
              <Button
                onClick={() => switchMode('five-blocks')}
                variant={mode === 'five-blocks' ? 'mahjong' : 'outline'}
                className={mode === 'five-blocks' ? '' : 'text-white border-white hover:bg-white hover:text-black'}
                size="sm"
              >
                ノーマル
              </Button>
              <Button
                onClick={() => switchMode('seven-pairs')}
                variant={mode === 'seven-pairs' ? 'mahjong' : 'outline'}
                className={mode === 'seven-pairs' ? '' : 'text-white border-white hover:bg-white hover:text-black'}
                size="sm"
              >
                七対子
              </Button>
            </div>
          </div>

          {/* ブロックの仕切り（補助線スタイル） */}
          <div className="border-2 border-white p-4 rounded">
            <div className={`grid gap-0 ${mode === 'five-blocks' ? 'grid-cols-5' : 'grid-cols-7'}`}>
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`p-2 min-h-20 bg-transparent ${mode === 'five-blocks'
                    ? (index < 4 ? 'border-r-2 border-white' : '')
                    : (index < 6 ? 'border-r-2 border-white' : '')
                    }`}
                  onDrop={(e) => {
                    e.preventDefault();
                    const tileData = e.dataTransfer.getData('tile');
                    if (tileData) {
                      const tile = JSON.parse(tileData);
                      handleBlockDrop(block.id, tile);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="flex flex-wrap gap-1 justify-center items-center h-full">
                    {block.tiles.map((tile, tileIndex) => (
                      <div
                        key={`${block.id}-${tile.id}-${tileIndex}`}
                        className="w-12 h-16 bg-mahjong-ivory-500 rounded border border-mahjong-ivory-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => handleBlockTileRemove(block.id, tileIndex)}
                        title="クリックで削除"
                      >
                        {tile.type}
                      </div>
                    ))}
                    {Array.from({ length: block.maxTiles - block.tiles.length }).map((_, tileIndex) => (
                      <div
                        key={`empty-${block.id}-${tileIndex}`}
                        className="w-12 h-16 border-2 border-dashed border-gray-400 flex items-center justify-center text-sm text-gray-400"
                      >
                        ?
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 未配置の牌（表示のみ、通常は空になる） */}
          {getRemainingTiles().length > 0 && (
            <div className="border-t border-gray-400 pt-4">
              <h3 className="text-sm font-medium text-white mb-2 font-japanese text-center">
                未配置の牌 ({getRemainingTiles().length}枚)
              </h3>
              <div className="flex flex-wrap gap-1 justify-center">
                {getRemainingTiles().map((tile) => (
                  <div
                    key={tile.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('tile', JSON.stringify(tile));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className="w-8 h-10 bg-mahjong-blue-500 rounded border border-mahjong-blue-600 flex items-center justify-center text-xs font-bold text-white cursor-grab hover:scale-105 transition-transform"
                    onClick={() => handleTileRemove(tile.id)}
                  >
                    {tile.type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* 操作ボタン */}
        <div className="flex justify-center gap-4">
          <Button onClick={resetBlocks} variant="mahjong">
            リセット
          </Button>
          <Button
            onClick={() => {
              const completedBlocks = blocks.filter(b => b.tiles.length === b.maxTiles).length;
              alert(`完成度: ${getTotalTiles()}/13\n完全なブロック: ${completedBlocks}/5`);
            }}
            variant="mahjong"
          >
            完成チェック
          </Button>
        </div>
      </div>
    </div>
  );
}