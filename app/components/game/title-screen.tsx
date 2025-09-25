'use client';

import { Button } from "@/components/ui/button";

interface Props {
  onStartGame: () => void;
}

export function TitleScreen({ onStartGame }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-mahjong-table-500">
        <div className="absolute inset-0 bg-mahjong-pattern opacity-20"></div>
        {/* 四隅の装飾 */}
        <div className="absolute top-8 left-8 w-16 h-16 border-4 border-mahjong-gold-500 rounded-full opacity-60"></div>
        <div className="absolute top-8 right-8 w-16 h-16 border-4 border-mahjong-gold-500 rounded-full opacity-60"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 border-4 border-mahjong-gold-500 rounded-full opacity-60"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-4 border-mahjong-gold-500 rounded-full opacity-60"></div>
      </div>

      <div className="text-center space-y-12 relative z-10">
        {/* メインタイトル */}
        <div className="space-y-6">
          <div className="relative">
            <h1 className="text-8xl font-bold text-mahjong-gold-400 mb-4 font-serif-jp drop-shadow-2xl">
              🀄 麻雀
            </h1>
            <div className="absolute -top-2 -left-2 w-full h-full text-8xl font-bold text-mahjong-gold-600 opacity-30 -z-10">
              🀄 麻雀
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-white font-japanese">
              2人対戦
            </h2>
            <p className="text-xl text-mahjong-gold-200 font-japanese">
              先に5ポイント獲得したプレイヤーの勝利！
            </p>
          </div>
        </div>

        {/* ゲーム説明 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-mahjong-gold-400/30 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-mahjong-gold-300 mb-4 font-japanese">
            ゲームルール
          </h3>
          <div className="space-y-3 text-left text-white/90 font-japanese">
            <p>• 13枚の手牌を選択してゲーム開始</p>
            <p>• 聴牌形提案で最適な手牌を確認</p>
            <p>• 和了でポイント獲得</p>
            <p>• 先に5ポイント獲得した方が勝利</p>
          </div>
        </div>

        {/* スタートボタン */}
        <div className="relative">
          <Button
            onClick={onStartGame}
            size="lg"
            className="px-16 py-6 text-2xl font-bold bg-gradient-to-r from-mahjong-gold-500 to-mahjong-gold-600 hover:from-mahjong-gold-600 hover:to-mahjong-gold-700 text-white rounded-2xl shadow-mahjong-button hover:shadow-mahjong-tile-hover transition-all duration-300 transform hover:scale-105 font-japanese border-2 border-mahjong-gold-400"
          >
            🎮 ゲームスタート
          </Button>
          <div className="absolute -inset-1 bg-gradient-to-r from-mahjong-gold-400 to-mahjong-gold-500 rounded-2xl blur opacity-75 -z-10"></div>
        </div>

        {/* 装飾的な牌のアイコン */}
        <div className="flex justify-center space-x-4 text-4xl opacity-30">
          <span>🀇</span>
          <span>🀈</span>
          <span>🀉</span>
          <span>🀊</span>
          <span>🀋</span>
          <span>🀌</span>
          <span>🀍</span>
          <span>🀎</span>
          <span>🀏</span>
        </div>
      </div>
    </div>
  );
}
