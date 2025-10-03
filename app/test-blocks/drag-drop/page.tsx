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

export default function DragDropBlocksPage() {
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'block1',
      name: 'ブロック1',
      tiles: [],
      maxTiles: 3,
      color: 'bg-blue-100 border-blue-300',
      description: '順子または刻子'
    },
    {
      id: 'block2',
      name: 'ブロック2',
      tiles: [],
      maxTiles: 3,
      color: 'bg-green-100 border-green-300',
      description: '順子または刻子'
    },
    {
      id: 'block3',
      name: 'ブロック3',
      tiles: [],
      maxTiles: 3,
      color: 'bg-yellow-100 border-yellow-300',
      description: '順子または刻子'
    },
    {
      id: 'block4',
      name: 'ブロック4',
      tiles: [],
      maxTiles: 3,
      color: 'bg-purple-100 border-purple-300',
      description: '順子または刻子'
    },
    {
      id: 'janto',
      name: '雀頭',
      tiles: [],
      maxTiles: 2,
      color: 'bg-red-100 border-red-300',
      description: '同じ牌のペア'
    },
  ]);

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
    if (selectedTiles.length < 13) {
      setSelectedTiles([...selectedTiles, tile]);
    }
  };

  const handleTileRemove = (tileId: string) => {
    setSelectedTiles(selectedTiles.filter(t => t.id !== tileId));
  };

  const handleDragStart = (e: React.DragEvent, tile: Tile) => {
    e.dataTransfer.setData('tile', JSON.stringify(tile));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDrop = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    const tileData = e.dataTransfer.getData('tile');
    if (tileData) {
      const tile = JSON.parse(tileData);
      const block = blocks.find(b => b.id === blockId);
      if (block && block.tiles.length < block.maxTiles) {
        setBlocks(blocks.map(b =>
          b.id === blockId
            ? { ...b, tiles: [...b.tiles, tile] }
            : b
        ));
        handleTileRemove(tile.id);
      }
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

  const getBlockStatus = (block: Block) => {
    if (block.tiles.length === 0) return 'empty';
    if (block.tiles.length === block.maxTiles) return 'complete';
    return 'partial';
  };

  const getTotalTiles = () => {
    return blocks.reduce((total, block) => total + block.tiles.length, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white font-japanese">
            5ブロック理論 - ドラッグ&ドロップ版
          </h1>
          <Link href="/test-blocks">
            <Button variant="mahjong">
              ← 戻る
            </Button>
          </Link>
        </div>

        {/* 説明 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-japanese text-center">
            5ブロック理論とは？
          </h2>
          <p className="text-white text-lg text-center">
            和了牌が完成するのに必要な「雀頭1組」と「メンツ4組」の合計5つのまとまり（ブロック）を目指す手組みの考え方です。
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

        {/* 選択された牌 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-japanese">
            選択された牌 ({selectedTiles.length}/13)
          </h2>
          <div className="flex flex-wrap gap-2">
            {selectedTiles.map((tile) => (
              <div
                key={tile.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tile)}
                className="w-12 h-16 bg-mahjong-blue-500 rounded-lg border-2 border-mahjong-blue-600 shadow-mahjong-tile flex items-center justify-center text-sm font-bold text-white cursor-grab hover:scale-105 transition-transform"
                onClick={() => handleTileRemove(tile.id)}
              >
                {tile.type}
              </div>
            ))}
          </div>
        </div>

        {/* 5ブロック表示 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-japanese text-center">
            5ブロック理論 - 手牌を5つのブロックに分けましょう
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((block) => {
              const status = getBlockStatus(block);
              return (
                <div
                  key={block.id}
                  className={`p-4 rounded-xl border-2 ${block.color} min-h-32 transition-all duration-200 ${status === 'complete' ? 'ring-2 ring-green-500' :
                      status === 'partial' ? 'ring-2 ring-yellow-500' : ''
                    }`}
                  onDrop={(e) => handleBlockDrop(e, block.id)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <h3 className="font-bold text-lg mb-2 text-center">{block.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 text-center">{block.description}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {block.tiles.map((tile, index) => (
                      <div
                        key={`${block.id}-${tile.id}-${index}`}
                        className="w-8 h-10 bg-mahjong-ivory-500 rounded border border-mahjong-ivory-600 flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => handleBlockTileRemove(block.id, index)}
                        title="クリックで削除"
                      >
                        {tile.type}
                      </div>
                    ))}
                    {Array.from({ length: block.maxTiles - block.tiles.length }).map((_, index) => (
                      <div
                        key={`empty-${block.id}-${index}`}
                        className="w-8 h-10 bg-gray-200 rounded border border-gray-400 flex items-center justify-center text-xs text-gray-500"
                      >
                        ?
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-2">
                    <span className={`text-xs font-bold ${status === 'complete' ? 'text-green-600' :
                        status === 'partial' ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                      {block.tiles.length}/{block.maxTiles}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 進捗表示 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 font-japanese text-center">進捗状況</h3>
          <div className="text-center">
            <p className="text-white text-lg">
              使用済み牌: {getTotalTiles()}/13 |
              残り牌: {13 - getTotalTiles()}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div
                className="bg-mahjong-gold-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(getTotalTiles() / 13) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="flex justify-center gap-4">
          <Button onClick={resetBlocks} variant="mahjong">
            リセット
          </Button>
          <Button
            onClick={() => {
              console.log('Blocks:', blocks);
              alert(`完成度: ${getTotalTiles()}/13\n完全なブロック: ${blocks.filter(b => b.tiles.length === b.maxTiles).length}/5`);
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
