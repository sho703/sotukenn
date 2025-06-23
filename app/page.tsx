'use client';

import { Suspense } from 'react';
import { GameHeader } from '@/app/components/game/game-header';
import { GameBoard } from '@/app/components/game/game-board';
import { HandZoneSkeleton, MahjongGridSkeleton } from '@/app/components/game/loading';
import { ConfirmButton } from '@/app/components/game/confirm-button';
import { useMahjongDeal } from './hooks/useMahjongDeal';

export default function Home() {
  const mahjongDeal = useMahjongDeal();
  console.log('Page mahjongDeal:', mahjongDeal); // デバッグログ
  const { handTiles } = mahjongDeal;

  const handleConfirm = () => {
    // TODO: 実際の確定処理を実装
    alert('確定しました！');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <GameHeader />
      <Suspense fallback={
        <div className="space-y-6">
          <HandZoneSkeleton />
          <MahjongGridSkeleton />
        </div>
      }>
        <div className="space-y-6">
          <GameBoard {...mahjongDeal} />
          <div className="flex justify-end">
            <ConfirmButton
              disabled={handTiles.length !== 13}
              onClick={handleConfirm}
            >
              確定
            </ConfirmButton>
          </div>
        </div>
      </Suspense>
    </main>
  );
}