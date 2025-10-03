'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
  completed: boolean;
}

export default function StepByStepBlocksPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'janto',
      name: '雀頭',
      tiles: [],
      maxTiles: 2,
      color: 'bg-red-100 border-red-300',
      description: '同じ牌のペア（例：東-東）',
      completed: false
    },
    {
      id: 'block1',
      name: 'ブロック1',
      tiles: [],
      maxTiles: 3,
      color: 'bg-blue-100 border-blue-300',
      description: '順子（1-2-3）または刻子（5-5-5）',
      completed: false
    },
    {
      id: 'block2',
      name: 'ブロック2',
      tiles: [],
      maxTiles: 3,
      color: 'bg-green-100 border-green-300',
      description: '順子（1-2-3）または刻子（5-5-5）',
      completed: false
    },
    {
      id: 'block3',
      name: 'ブロック3',
      tiles: [],
      maxTiles: 3,
      color: 'bg-yellow-100 border-yellow-300',
      description: '順子（1-2-3）または刻子（5-5-5）',
      completed: false
    },
    {
      id: 'block4',
      name: 'ブロック4',
      tiles: [],
      maxTiles: 3,
      color: 'bg-purple-100 border-purple-300',
      description: '順子（1-2-3）または刻子（5-5-5）',
      completed: false
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

  const checkBlockCompletion = (block: Block) => {
    return block.tiles.length === block.maxTiles;
  };

  const handleNextStep = () => {
    if (currentStep < blocks.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetAll = () => {
    setCurrentStep(0);
    setBlocks(blocks.map(b => ({ ...b, tiles: [], completed: false })));
    setSelectedTiles([]);
  };

  const getCurrentBlock = () => blocks[currentStep];
  const isCurrentBlockComplete = checkBlockCompletion(getCurrentBlock());
  const totalCompletedBlocks = blocks.filter(b => checkBlockCompletion(b)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8 font-japanese">
          5ブロック理論 - ステップバイステップ版
        </h1>

        {/* 進捗表示 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-japanese text-center">
            進捗状況
          </h2>
          <div className="flex justify-center items-center gap-4 mb-4">
            <Button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              variant="mahjong"
            >
              ← 前のステップ
            </Button>
            <span className="text-white text-xl font-bold">
              ステップ {currentStep + 1}/5
            </span>
            <Button
              onClick={handleNextStep}
              disabled={currentStep === blocks.length - 1}
              variant="mahjong"
            >
              次のステップ →
            </Button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-mahjong-gold-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / blocks.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-white text-center mt-2">
            完了ブロック: {totalCompletedBlocks}/5
          </p>
        </div>

        {/* 現在のステップ */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 font-japanese text-center">
            ステップ {currentStep + 1}: {getCurrentBlock().name}を作成
          </h2>
          <p className="text-white text-lg text-center mb-6">
            {getCurrentBlock().description}
          </p>

          <div className={`p-6 rounded-xl border-2 ${getCurrentBlock().color} min-h-32 mx-auto max-w-md`}>
            <h3 className="font-bold text-lg mb-4 text-center">{getCurrentBlock().name}</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {getCurrentBlock().tiles.map((tile, index) => (
                <div
                  key={`${getCurrentBlock().id}-${tile.id}-${index}`}
                  className="w-12 h-16 bg-mahjong-ivory-500 rounded border border-mahjong-ivory-600 flex items-center justify-center text-sm font-bold cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => handleBlockTileRemove(getCurrentBlock().id, index)}
                  title="クリックで削除"
                >
                  {tile.type}
                </div>
              ))}
              {Array.from({ length: getCurrentBlock().maxTiles - getCurrentBlock().tiles.length }).map((_, index) => (
                <div
                  key={`empty-${getCurrentBlock().id}-${index}`}
                  className="w-12 h-16 bg-gray-200 rounded border border-gray-400 flex items-center justify-center text-sm text-gray-500"
                >
                  ?
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <span className={`text-sm font-bold ${isCurrentBlockComplete ? 'text-green-600' : 'text-gray-500'
                }`}>
                {getCurrentBlock().tiles.length}/{getCurrentBlock().maxTiles}
                {isCurrentBlockComplete && ' ✓ 完了！'}
              </span>
            </div>
          </div>
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
                onClick={() => handleBlockDrop(getCurrentBlock().id, tile)}
                className="w-12 h-16 bg-mahjong-blue-500 rounded-lg border-2 border-mahjong-blue-600 shadow-mahjong-tile flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:scale-105 transition-transform"
              >
                {tile.type}
              </div>
            ))}
          </div>
        </div>

        {/* 全ブロック表示 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-japanese text-center">
            全ブロック表示
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className={`p-4 rounded-xl border-2 ${block.color} min-h-24 ${index === currentStep ? 'ring-2 ring-mahjong-gold-500' : ''
                  }`}
              >
                <h3 className="font-bold text-lg mb-2 text-center">
                  {block.name} {checkBlockCompletion(block) && '✓'}
                </h3>
                <div className="flex flex-wrap gap-1 justify-center">
                  {block.tiles.map((tile, tileIndex) => (
                    <div
                      key={`${block.id}-${tile.id}-${tileIndex}`}
                      className="w-8 h-10 bg-mahjong-ivory-500 rounded border border-mahjong-ivory-600 flex items-center justify-center text-xs font-bold"
                    >
                      {tile.type}
                    </div>
                  ))}
                  {Array.from({ length: block.maxTiles - block.tiles.length }).map((_, tileIndex) => (
                    <div
                      key={`empty-${block.id}-${tileIndex}`}
                      className="w-8 h-10 bg-gray-200 rounded border border-gray-400 flex items-center justify-center text-xs text-gray-500"
                    >
                      ?
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="flex justify-center gap-4">
          <Button onClick={resetAll} variant="mahjong">
            リセット
          </Button>
          <Button
            onClick={() => {
              alert(`完成度: ${totalCompletedBlocks}/5\n現在のステップ: ${currentStep + 1}/5`);
            }}
            variant="mahjong"
          >
            進捗確認
          </Button>
        </div>
      </div>
    </div>
  );
}
