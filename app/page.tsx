"use client";

import { useMahjongDeal } from "./hooks/useMahjongDeal";
import MahjongGrid from "./components/MahjongGrid";
import HandZone from "./components/HandZone";
import GameHeader from "./components/GameHeader";
import ConfirmButton from "./components/ConfirmButton";
import DoraIndicator from "./components/DoraIndicator";

export default function Page() {
  const {
    handTiles,
    poolTiles,
    dora,
    reset,
    moveTile,
    reorderZone,
  } = useMahjongDeal();

  const handleTileDrop = (
    tileId: string,
    fromZone: "hand" | "pool",
    toZone: "hand" | "pool",
    atIdx?: number
  ) => {
    moveTile(tileId, fromZone, toZone, atIdx);
  };

  const handleReorder = (
    zone: "hand" | "pool",
    fromIdx: number,
    toIdx: number
  ) => {
    reorderZone(zone, fromIdx, toIdx);
  };

  const handleConfirm = () => {
    alert(
      `選択した13枚: ${handTiles.map((t) => t.type).join(", ")}\nドラ: ${dora}`
    );
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
          手牌を全て戻す
        </button>
      </div>
      <section className="mb-6">
        <h2 className="mb-2 font-semibold">手牌ゾーン（13枚まで）</h2>
        <HandZone
          tiles={handTiles}
          onTileDrop={handleTileDrop}
          onReorder={handleReorder}
        />
      </section>
      <section className="mb-6">
        <h2 className="mb-2 font-semibold">配牌</h2>
        <MahjongGrid
          tiles={poolTiles}
          onTileDrop={handleTileDrop}
          onReorder={handleReorder}
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