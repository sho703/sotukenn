'use client';

import React from 'react';
import Image from 'next/image';
import { getTileImagePath } from '@/app/lib/mahjong';

interface TenpaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitingTiles: string[];
  isTenpai: boolean;
  error?: string;
}

export function TenpaiModal({ isOpen, onClose, waitingTiles, isTenpai, error }: TenpaiModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isTenpai ? '🎉 聴牌です！' : '❌ 聴牌ではありません'}
            </h2>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>

          {/* 待ち牌表示 */}
          {isTenpai && waitingTiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
                待ち牌 ({waitingTiles.length}種類)
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {waitingTiles.map((tileType, index) => (
                  <div key={`waiting-${tileType}-${index}`} className="relative">
                    <div className="w-12 h-16">
                      <Image
                        src={getTileImagePath(tileType as any)}
                        alt={tileType}
                        fill
                        sizes="48px"
                        className="object-contain"
                        priority={false}
                      />
                    </div>
                    <div className="text-xs text-center mt-1 text-gray-600 font-mono">
                      {tileType}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* メッセージ */}
          <div className="text-center mb-6">
            {isTenpai ? (
              <p className="text-gray-600">
                選択した手牌は聴牌です！<br />
                上記の牌を引けば上がれます。
              </p>
            ) : (
              <p className="text-gray-600">
                選択した手牌は聴牌ではありません。<br />
                別の組み合わせを選択してください。
              </p>
            )}
          </div>

          {/* ボタン */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-400/50 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isTenpai ? 'ゲーム開始' : '再選択'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
