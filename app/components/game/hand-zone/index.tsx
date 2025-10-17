'use client';

import { MahjongTile } from '../mahjong-tile';
import Image from 'next/image';
import { Tile } from '../types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { HintPopup } from '@/app/components/ui/hint-popup';

interface Props {
  tiles: Tile[];
  onTileClick: (tileId: string) => void;
}

// クリック可能な麻雀牌コンポーネント
function ClickableMahjongTile({ tile, onTileClick }: { tile: Tile; onTileClick: (tileId: string) => void }) {
  return (
    <div
      onClick={() => onTileClick(tile.id)}
      className="cursor-pointer hover:scale-105 transition-transform"
    >
      <MahjongTile
        tile={tile}
        selected
        priority={true}
      />
    </div>
  );
}

export function HandZone({ tiles = [], onTileClick }: Props) {
  const [mode, setMode] = useState<'none' | 'normal' | 'seven-pairs'>('normal');
  const [isHintOpen, setIsHintOpen] = useState(false);

  // 例示用の牌（薄く表示）
  const exampleTiles = {
    normal: [
      // 123m (順子)
      { id: 'ex1', type: 'man', imagePath: '/images/tiles/1man.gif' }, { id: 'ex2', type: 'man', imagePath: '/images/tiles/2man.gif' }, { id: 'ex3', type: 'man', imagePath: '/images/tiles/3man.gif' },
      // 456p (順子)
      { id: 'ex4', type: 'pin', imagePath: '/images/tiles/4pin.gif' }, { id: 'ex5', type: 'pin', imagePath: '/images/tiles/5pin.gif' }, { id: 'ex6', type: 'pin', imagePath: '/images/tiles/6pin.gif' },
      // 789s (順子)
      { id: 'ex7', type: 'sou', imagePath: '/images/tiles/9sou.gif' }, { id: 'ex8', type: 'sou', imagePath: '/images/tiles/9sou.gif' }, { id: 'ex9', type: 'sou', imagePath: '/images/tiles/9sou.gif' },
      // 45s (順子)
      { id: 'ex10', type: 'sou', imagePath: '/images/tiles/4sou.gif' }, { id: 'ex11', type: 'sou', imagePath: '/images/tiles/5sou.gif' },
      // 南南 (雀頭)
      { id: 'ex12', type: 'jihai', imagePath: '/images/tiles/nan.gif' }, { id: 'ex13', type: 'jihai', imagePath: '/images/tiles/nan.gif' }
    ],
    'seven-pairs': [
      // 11m
      { id: 'ex1', type: 'man', imagePath: '/images/tiles/1man.gif' }, { id: 'ex2', type: 'man', imagePath: '/images/tiles/1man.gif' },
      // 33p
      { id: 'ex3', type: 'pin', imagePath: '/images/tiles/3pin.gif' }, { id: 'ex4', type: 'pin', imagePath: '/images/tiles/3pin.gif' },
      // 55s
      { id: 'ex5', type: 'sou', imagePath: '/images/tiles/5sou.gif' }, { id: 'ex6', type: 'sou', imagePath: '/images/tiles/5sou.gif' },
      // 66s
      { id: 'ex7', type: 'sou', imagePath: '/images/tiles/6sou.gif' }, { id: 'ex8', type: 'sou', imagePath: '/images/tiles/6sou.gif' },
      // 東東
      { id: 'ex9', type: 'jihai', imagePath: '/images/tiles/ton.gif' }, { id: 'ex10', type: 'jihai', imagePath: '/images/tiles/ton.gif' },
      // 北北
      { id: 'ex11', type: 'jihai', imagePath: '/images/tiles/pei.gif' }, { id: 'ex12', type: 'jihai', imagePath: '/images/tiles/pei.gif' },
      // 中 (単騎)
      { id: 'ex13', type: 'jihai', imagePath: '/images/tiles/chun.gif' }
    ]
  };

  const getBlockLayout = () => {
    if (mode === 'normal') {
      return [3, 3, 3, 2, 2]; // 3:3:3:2:2
    } else if (mode === 'seven-pairs') {
      return [2, 2, 2, 2, 2, 2, 1]; // 2:2:2:2:2:2:1
    }
    return [];
  };

  const renderGuideLines = () => {
    if (mode === 'none') return null;

    const layout = getBlockLayout();
    const exampleTilesForMode = mode === 'normal' ? exampleTiles.normal : exampleTiles['seven-pairs'];

    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex h-full">
          {layout.map((blockSize, blockIndex) => (
            <div
              key={blockIndex}
              className={`flex-1 border-r-2 border-white/50 ${blockIndex === layout.length - 1 ? 'border-r-0' : ''}`}
            >
              <div className="flex flex-wrap gap-1 justify-center items-center h-full p-2">
                {tiles.length === 0 && Array.from({ length: blockSize }).map((_, tileIndex) => {
                  // 正しいインデックスを計算
                  let tileIndexInArray = 0;
                  for (let i = 0; i < blockIndex; i++) {
                    tileIndexInArray += layout[i];
                  }
                  tileIndexInArray += tileIndex;

                  const exampleTile = exampleTilesForMode[tileIndexInArray] || exampleTilesForMode[0];
                  return (
                    <div key={tileIndex} className="opacity-20 w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22 flex items-center justify-center relative">
                      <Image
                        src={exampleTile.imagePath}
                        alt={`例示 ${exampleTile.type}`}
                        fill
                        className="object-contain"
                        priority={false}
                        draggable={false}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* モード切り替えボタン */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => setMode('none')}
            variant={mode === 'none' ? 'mahjong' : 'outline'}
            className={mode === 'none' ? '' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}
            size="sm"
          >
            なし
          </Button>
          <Button
            onClick={() => setMode('normal')}
            variant={mode === 'normal' ? 'mahjong' : 'outline'}
            className={mode === 'normal' ? '' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}
            size="sm"
          >
            アシスト
          </Button>
          <Button
            onClick={() => setMode('seven-pairs')}
            variant={mode === 'seven-pairs' ? 'mahjong' : 'outline'}
            className={mode === 'seven-pairs' ? '' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}
            size="sm"
          >
            七対子
          </Button>
        </div>
        {/* ヒントボタン（アシストモードの時のみ表示） */}
        {(mode === 'normal' || mode === 'seven-pairs') && (
          <Button
            onClick={() => setIsHintOpen(true)}
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
            size="sm"
          >
            💡 ヒント
          </Button>
        )}
      </div>

      {/* 手札表示エリア */}
      <div className="relative min-h-24 flex flex-wrap justify-center gap-2 p-6 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50/80">
        {/* 補助線と例示牌 */}
        {renderGuideLines()}

        {/* 実際の牌 */}
        {tiles.length === 0 && <div className="text-gray-400 text-lg font-semibold relative z-10">ここに13枚クリックして移動</div>}
        {mode === 'none' ? (
          // なしモード：通常の表示
          tiles.map((tile) => (
            <ClickableMahjongTile
              key={tile.id}
              tile={tile}
              onTileClick={onTileClick}
            />
          ))
        ) : (
          // アシスト・七対子モード：ブロック内に配置
          <div className="flex h-full w-full">
            {getBlockLayout().map((blockSize, blockIndex) => {
              let tileIndex = 0;
              // 前のブロックの牌数を計算
              for (let i = 0; i < blockIndex; i++) {
                tileIndex += getBlockLayout()[i];
              }

              return (
                <div
                  key={blockIndex}
                  className={`flex-1 border-r-2 border-transparent ${blockIndex === getBlockLayout().length - 1 ? 'border-r-0' : ''}`}
                >
                  <div className="flex flex-wrap gap-1 justify-center items-center h-full p-2">
                    {Array.from({ length: blockSize }).map((_, slotIndex) => {
                      const tile = tiles[tileIndex];
                      tileIndex++;

                      if (tile) {
                        return (
                          <div key={tile.id} className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22 flex items-center justify-center">
                            <ClickableMahjongTile
                              tile={tile}
                              onTileClick={onTileClick}
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div key={`empty-${blockIndex}-${slotIndex}`} className="w-12 h-16 sm:w-14 sm:h-18 md:w-16 md:h-22" />
                        );
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ヒントポップアップ */}
      <HintPopup
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        title={mode === 'seven-pairs' ? "🀄 七対子（チートイツ）のヒント" : "🀄 手札選択のヒント"}
      >
        {mode === 'seven-pairs' ? (
          // 七対子モードのヒント
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3">
                📋 七対子（チートイツ）の基本ルール
              </h3>
              <p className="text-lg sm:text-xl leading-relaxed text-gray-700">
                <span className="font-bold text-blue-600">13枚の手札</span>で同じ牌2枚を6組と単独の牌1枚を作ります：
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    同じ牌2枚を <span className="text-green-600">6組</span>
                  </p>
                  <div className="flex gap-3">
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/1man.gif" alt="1万" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/1man.gif" alt="1万" fill sizes="56px" className="object-contain" />
                    </div>
                    <span className="text-lg font-bold text-gray-600 flex items-center">や</span>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/3pin.gif" alt="3筒" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/3pin.gif" alt="3筒" fill sizes="56px" className="object-contain" />
                    </div>
                    <span className="text-lg font-bold text-gray-600 flex items-center">や</span>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/5sou.gif" alt="5索" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/5sou.gif" alt="5索" fill sizes="56px" className="object-contain" />
                    </div>
                  </div>
                  <p className="text-base text-gray-600 mt-2">
                    💡 同じ牌が2枚ずつ6種類必要です！
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    単独の牌を <span className="text-red-600">1枚</span>
                  </p>
                  <div className="flex gap-3">
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/chun.gif" alt="中" fill sizes="56px" className="object-contain border-2 border-green-500" />
                    </div>
                  </div>
                  <p className="text-base text-gray-600 mt-2">
                    💡 この牌が出れば上がりです！
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
              <h4 className="text-lg sm:text-xl font-bold text-orange-800 mb-3">
                🎯 戦略のヒント
              </h4>
              <p className="text-base sm:text-lg text-gray-700 mb-3">
                <span className="font-bold text-orange-600">同じ牌は4枚しかない</span>ため、<br />
                自分が1枚しか持っていない牌を最後の1枚として選ぶと有利です！
              </p>
              <div className="bg-white rounded-lg p-3 border border-orange-300">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>💡 例：自分が</span>
                    <div className="relative w-10 h-14">
                      <Image src="/images/tiles/1man.gif" alt="1万" fill sizes="40px" className="object-contain" />
                    </div>
                    <span>を<span className="font-bold text-orange-600">1枚だけ</span>持っている場合</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="relative w-10 h-14">
                      <Image src="/images/tiles/1man.gif" alt="1万" fill sizes="40px" className="object-contain" />
                    </div>
                    <span>を単独牌にすると、相手が捨てる確率が高くなり、上がりやすくなります</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <p className="text-base sm:text-lg text-gray-600">
                💡 七対子（チートイツ）アシスト表示の区切り線に従って、この形になるように牌を選んでください
              </p>
            </div>
          </div>
        ) : (
          // 通常モードのヒント
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3">
                📋 このゲームの基本ルール
              </h3>
              <p className="text-lg sm:text-xl leading-relaxed text-gray-700">
                <span className="font-bold text-blue-600">13枚の手札</span>で以下の組み合わせを作ります：
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    3枚セットを <span className="text-green-600">3組</span>
                  </p>
                  <div className="flex gap-3">
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/1man.gif" alt="1万" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/2man.gif" alt="2万" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/3man.gif" alt="3万" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/4pin.gif" alt="4筒" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/5pin.gif" alt="5筒" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/6pin.gif" alt="6筒" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/9sou.gif" alt="9索" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/9sou.gif" alt="9索" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/9sou.gif" alt="9索" fill sizes="56px" className="object-contain" />
                    </div>
                  </div>
                  <p className="text-base text-gray-600 mt-2">
                    💡 連続する牌（1-2-3）や同じ牌（9-9-9）どちらでもOK！
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    同じ牌2枚を <span className="text-red-600">1組</span>
                  </p>
                  <div className="flex gap-3">
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/nan.gif" alt="南" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/nan.gif" alt="南" fill sizes="56px" className="object-contain" />
                    </div>
                    <span className="text-lg font-bold text-gray-600 flex items-center">や</span>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/8sou.gif" alt="8索" fill sizes="56px" className="object-contain" />
                    </div>
                    <div className="relative w-14 h-18">
                      <Image src="/images/tiles/8sou.gif" alt="8索" fill sizes="56px" className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    2枚で待ち牌を作る組み合わせを <span className="text-orange-600">1組</span>
                  </p>

                  {/* 両面待ちの例 */}
                  <div className="mb-4">
                    <p className="text-lg font-bold text-gray-700 mb-2">
                      真ん中で2種類待ちの例：<span className="text-green-600 font-bold">（最も有利！2枚待ち）</span>
                    </p>
                    <div className="flex gap-3 mb-2">
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/3pin.gif" alt="3筒" fill sizes="56px" className="object-contain" />
                      </div>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/4pin.gif" alt="4筒" fill sizes="56px" className="object-contain" />
                      </div>
                      <span className="text-lg font-bold text-gray-600 flex items-center">→</span>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/2pin.gif" alt="2筒待ち" fill sizes="56px" className="object-contain border-2 border-green-500" />
                      </div>
                      <span className="text-lg font-bold text-gray-600 flex items-center">または</span>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/5pin.gif" alt="5筒待ち" fill sizes="56px" className="object-contain border-2 border-green-500" />
                      </div>
                    </div>
                    <p className="text-base text-green-600 font-bold">
                      💡 2種類の牌で上がれるので、最も待ちやすい！
                    </p>
                  </div>

                  {/* カンチャン待ちの例 */}
                  <div className="mb-4">
                    <p className="text-lg font-bold text-gray-700 mb-2">
                      間で1種類待ちの例：<span className="text-yellow-600 font-bold">（1枚待ち）</span>
                    </p>
                    <div className="flex gap-3 mb-2">
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/1man.gif" alt="1万" fill sizes="56px" className="object-contain" />
                      </div>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/3man.gif" alt="3万" fill sizes="56px" className="object-contain" />
                      </div>
                      <span className="text-lg font-bold text-gray-600 flex items-center">→</span>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/2man.gif" alt="2万待ち" fill sizes="56px" className="object-contain border-2 border-green-500" />
                      </div>
                    </div>
                  </div>

                  {/* ペンチャン待ちの例 */}
                  <div className="mb-4">
                    <p className="text-lg font-bold text-gray-700 mb-2">
                      端で1種類待ちの例：<span className="text-red-600 font-bold">（1枚待ち）</span>
                    </p>
                    <div className="flex gap-3 mb-2">
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/8sou.gif" alt="8索" fill sizes="56px" className="object-contain" />
                      </div>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/9sou.gif" alt="9索" fill sizes="56px" className="object-contain" />
                      </div>
                      <span className="text-lg font-bold text-gray-600 flex items-center">→</span>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/7sou.gif" alt="7索待ち" fill sizes="56px" className="object-contain border-2 border-green-500" />
                      </div>
                    </div>
                    <div className="flex gap-3 mb-2">
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/1man.gif" alt="1万" fill sizes="56px" className="object-contain" />
                      </div>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/2man.gif" alt="2万" fill sizes="56px" className="object-contain" />
                      </div>
                      <span className="text-lg font-bold text-gray-600 flex items-center">→</span>
                      <div className="relative w-14 h-18">
                        <Image src="/images/tiles/3man.gif" alt="3万待ち" fill sizes="56px" className="object-contain border-2 border-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
              <p className="text-xl sm:text-2xl leading-relaxed text-gray-700 mb-4">
                <span className="font-bold text-yellow-700">上がり方：</span>
                ③で作った2枚が①のような3枚セットになる牌を相手が出せば上がりです！
              </p>
              <div className="flex gap-3 items-center justify-center">
                <div className="relative w-14 h-18">
                  <Image src="/images/tiles/3pin.gif" alt="3筒" fill sizes="56px" className="object-contain" />
                </div>
                <div className="relative w-14 h-18">
                  <Image src="/images/tiles/4pin.gif" alt="4筒" fill sizes="56px" className="object-contain" />
                </div>
                <span className="text-lg font-bold text-gray-600 mx-2">+</span>
                <div className="relative w-14 h-18">
                  <Image src="/images/tiles/2pin.gif" alt="2筒" fill sizes="56px" className="object-contain border-2 border-green-500" />
                </div>
                <span className="text-lg font-bold text-gray-600 mx-2">=</span>
                <div className="relative w-14 h-18">
                  <Image src="/images/tiles/2pin.gif" alt="2筒" fill sizes="56px" className="object-contain" />
                </div>
                <div className="relative w-14 h-18">
                  <Image src="/images/tiles/3pin.gif" alt="3筒" fill sizes="56px" className="object-contain" />
                </div>
                <div className="relative w-14 h-18">
                  <Image src="/images/tiles/4pin.gif" alt="4筒" fill sizes="56px" className="object-contain" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <p className="text-base sm:text-lg text-gray-600">
                💡 アシスト表示の区切り線に従って、この形になるように牌を選んでください
              </p>
            </div>
          </div>
        )}
      </HintPopup>
    </div>
  );
}