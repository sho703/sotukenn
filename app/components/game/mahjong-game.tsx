'use client';

import { useMahjongGame } from '@/app/hooks/useMahjongGame';
import { Tile } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function MahjongGame() {
  const {
    gameState,
    startGame,
    resetGame,
    selectTile,
    discardTile,
    message,
    isLoading,
    error
  } = useMahjongGame();

  // 牌をレンダリング
  const renderTile = (tile: Tile, onClick?: () => void) => (
    <div
      key={tile.id}
      className={cn(
        "relative w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20",
        onClick && "cursor-pointer hover:opacity-75"
      )}
      onClick={onClick}
    >
      <Image
        src={tile.imagePath}
        alt={tile.type}
        fill
        className="object-contain"
      />
    </div>
  );

  // 裏向きの牌をレンダリング
  const renderHiddenTile = () => (
    <div className="w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20 bg-gray-300 rounded" />
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">二人麻雀</h1>
        <div className="space-x-2">
          <button
            onClick={startGame}
            disabled={gameState.phase !== 'initial'}
            className={cn(
              "px-4 py-2 rounded",
              gameState.phase === 'initial'
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500"
            )}
          >
            ゲーム開始
          </button>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            リセット
          </button>
        </div>
      </div>

      {/* メッセージ表示 */}
      {(message || error) && (
        <div className={cn(
          "p-4 rounded",
          error ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
        )}>
          {error || message}
        </div>
      )}

      {/* ゲーム画面 */}
      <div className="space-y-8">
        {/* CPU手牌 */}
        <section>
          <h2 className="text-lg font-semibold mb-2">CPU手牌</h2>
          <div className="flex gap-1 bg-gray-100 p-4 rounded-lg">
            {gameState.cpu.tiles.map(() => renderHiddenTile())}
          </div>
        </section>

        {/* 場の情報 */}
        <section className="bg-green-100 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold">ドラ表示牌：</span>
              {renderTile({
                id: 'dora',
                type: gameState.dora,
                imagePath: `/images/tiles/${gameState.dora}.gif`
              })}
            </div>
            <div className="text-lg">
              <div>プレイヤー：{gameState.player.points}点</div>
              <div>CPU：{gameState.cpu.points}点</div>
            </div>
          </div>
        </section>

        {/* 最後の捨て牌 */}
        {gameState.lastDiscard && (
          <section>
            <h2 className="text-lg font-semibold mb-2">最後の捨て牌</h2>
            <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg">
              {renderTile(gameState.lastDiscard.tile)}
              <span>
                {gameState.lastDiscard.from === 'player' ? 'あなた' : 'CPU'}が捨てた牌です
              </span>
            </div>
          </section>
        )}

        {/* プレイヤー手牌 */}
        <section>
          <h2 className="text-lg font-semibold mb-2">あなたの手牌</h2>
          <div className="flex flex-wrap gap-2 bg-blue-50 p-4 rounded-lg">
            {gameState.phase === 'dealing' ? (
              // 配牌フェーズ：34枚から13枚を選択
              gameState.player.tiles.map(tile =>
                renderTile(tile, () => selectTile(tile))
              )
            ) : (
              // 対局フェーズ：手牌から1枚を選択して捨てる
              gameState.player.tiles.map(tile =>
                renderTile(
                  tile,
                  gameState.turn === 'player' ? () => discardTile(tile) : undefined
                )
              )
            )}
          </div>
        </section>

        {/* 捨て牌表示 */}
        <div className="grid grid-cols-2 gap-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">あなたの捨て牌</h2>
            <div className="flex flex-wrap gap-1 bg-gray-50 p-4 rounded-lg">
              {gameState.player.discards.map(tile => renderTile(tile))}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2">CPUの捨て牌</h2>
            <div className="flex flex-wrap gap-1 bg-gray-50 p-4 rounded-lg">
              {gameState.cpu.discards.map(tile => renderTile(tile))}
            </div>
          </section>
        </div>

        {/* 勝敗表示 */}
        {gameState.phase === 'finished' && gameState.winner && (
          <div className={cn(
            "p-6 rounded-lg text-center",
            gameState.winner.who === 'player' ? "bg-blue-100" : "bg-red-100"
          )}>
            <h2 className="text-2xl font-bold mb-2">
              {gameState.winner.who === 'player' ? "あなたの勝利！" : "CPUの勝利"}
            </h2>
            <p className="text-lg mb-2">
              {gameState.winner.points}点の和了です
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {gameState.winner.yaku.map((yaku, i) => (
                <span key={i} className="px-2 py-1 bg-white rounded text-sm">
                  {yaku}
                </span>
              ))}
            </div>
            <button
              onClick={resetGame}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
            >
              新しいゲームを始める
            </button>
          </div>
        )}
      </div>

      {/* ローディング表示 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            処理中...
          </div>
        </div>
      )}
    </div>
  );
}

