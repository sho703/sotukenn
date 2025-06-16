"use client";

import GameHeader from "./components/GameHeader";
import MahjongGrid from "./components/MahjongGrid";
import HandZone from "./components/HandZone";
import DoraIndicator from "./components/DoraIndicator";
import ConfirmButton from "./components/ConfirmButton";
import { useMahjongDeal } from "./hooks/useMahjongDeal";

export default function Page() {
  const {
    handTiles,
    poolTiles,
    dora,
    reset,
    moveToHand,
    moveToPool,
    reorderHand,
  } = useMahjongDeal();

  // ドラッグ開始: 牌の名前をDataTransferに保存
  const handleTileDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    tile: string
  ) => {
    e.dataTransfer.setData("text/plain", tile);
  };

  // 配牌グリッドから手牌ゾーンへのドロップ
  const handleHandDrop = (tile: string) => moveToHand(tile);

  // 手牌から配牌プールに戻す（クリックで）
  const handleHandTileRemove = (tile: string) => moveToPool(tile);

  // 確定ボタン押下
  const handleConfirm = () => {
    alert(`選択した13枚: ${handTiles.join(", ")}\nドラ: ${dora}`);
    // ここでAPI送信や遷移など追加可能
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <GameHeader />
      <div className="flex justify-between items-center mb-4">
        <DoraIndicator dora={dora} />
        <button
          className="ml-auto text-sm px-3 py-1 border rounded bg-gray-100 hover:bg-gray-500 text-gray-600 transition-colors"
          onClick={reset}
        >
          配牌リセット
        </button>
      </div>
      <section className="mb-6">
        <h2 className="mb-2 font-semibold">手牌ゾーン（13枚まで）</h2>
        <HandZone
          tiles={handTiles}
          onTileDrop={handleHandDrop}
          onTileDragStart={handleTileDragStart}
          onTileRemove={handleHandTileRemove}
        />
      </section>
      <section className="mb-6">
        <h2 className="mb-2 font-semibold">配牌（残り）</h2>
        <MahjongGrid
          tiles={poolTiles}
          onTileDragStart={handleTileDragStart}
          onTileClick={moveToHand}
        />
      </section>
      <div className="flex justify-end">
        <ConfirmButton
          disabled={handTiles.length !== 13}
          onClick={handleConfirm}
        >
          確定
        </ConfirmButton>
      </div>
    </main>
  );
}