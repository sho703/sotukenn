'use client';

import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { getTileImagePath } from '@/app/lib/mahjong';

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
            <h1 className="text-8xl font-bold text-mahjong-gold-400 mb-4 font-serif-jp">
              🀄 麻雀
            </h1>
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

        {/* スタートボタン */}
        <div className="relative">
          <Button
            onClick={onStartGame}
            size="lg"
            className="px-16 py-6 text-2xl font-bold bg-gradient-to-r from-mahjong-gold-500 to-mahjong-gold-600 text-white rounded-2xl shadow-mahjong-button transition-all duration-300 transform font-japanese border-2 border-mahjong-gold-400"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
            }}
          >
            🎮 ゲームスタート
          </Button>
          <div className="absolute -inset-1 bg-gradient-to-r from-mahjong-gold-400 to-mahjong-gold-500 rounded-2xl blur opacity-75 -z-10"></div>
        </div>

        {/* 麻雀の基本説明 */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-mahjong-gold-400/30 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-mahjong-gold-300 mb-6 font-japanese text-center">
            🀄 麻雀って何？
          </h3>

          <div className="space-y-6 text-white/90 font-japanese">
            {/* 牌の種類説明 */}
            <div>
              <h4 className="text-2xl font-bold text-mahjong-gold-200 mb-3">牌（パイ）の種類</h4>
              <p className="mb-3 text-lg">麻雀は34種類の牌を使って遊びます。それぞれ4枚ずつ、合計136枚あります。</p>

              {/* 数牌の説明 */}
              <div className="mb-4">
                <h5 className="text-xl font-semibold text-mahjong-blue-300 mb-2">数牌（すうはい）：1～9の数字の牌</h5>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-sm text-mahjong-gold-200 mb-2">萬子（マンズ）</p>
                    <div className="flex justify-center space-x-1">
                      {['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m'].map((tile) => (
                        <div key={tile} className="relative w-8 h-12">
                          <Image
                            src={getTileImagePath(tile)}
                            alt={tile}
                            fill
                            sizes="32px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-mahjong-gold-200 mb-2">筒子（ピンズ）</p>
                    <div className="flex justify-center space-x-1">
                      {['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'].map((tile) => (
                        <div key={tile} className="relative w-8 h-12">
                          <Image
                            src={getTileImagePath(tile)}
                            alt={tile}
                            fill
                            sizes="32px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-mahjong-gold-200 mb-2">索子（ソーズ）</p>
                    <div className="flex justify-center space-x-1">
                      {['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s'].map((tile) => (
                        <div key={tile} className="relative w-8 h-12">
                          <Image
                            src={getTileImagePath(tile)}
                            alt={tile}
                            fill
                            sizes="32px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 字牌の説明 */}
              <div className="mb-4">
                <h5 className="text-xl font-semibold text-mahjong-red-300 mb-2">字牌（じはい）：文字の牌</h5>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-base text-mahjong-gold-200 mb-2">風牌（フォンパイ）</p>
                    <div className="flex justify-center space-x-1">
                      {['東', '南', '西', '北'].map((tile) => (
                        <div key={tile} className="relative w-8 h-12">
                          <Image
                            src={getTileImagePath(tile)}
                            alt={tile}
                            fill
                            sizes="32px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-mahjong-gold-200 mt-1">東・南・西・北</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <p className="text-base text-mahjong-gold-200">三元牌（サンゲンパイ）</p>
                      <span className="text-xs text-mahjong-red-300 bg-mahjong-red-500/20 px-2 py-1 rounded">
                        ⚠️ 白はオールマイティではない
                      </span>
                    </div>
                    <div className="flex justify-center space-x-1">
                      {['白', '發', '中'].map((tile) => (
                        <div key={tile} className="relative w-8 h-12">
                          <Image
                            src={getTileImagePath(tile)}
                            alt={tile}
                            fill
                            sizes="32px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-mahjong-gold-200 mt-1">白・発・中</p>
                  </div>
                </div>
              </div>
            </div>


            {/* 基本的な組み合わせ */}
            <div>
              <h4 className="text-2xl font-bold text-mahjong-gold-200 mb-3">基本的な組み合わせ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-mahjong-blue-500/20 p-3 rounded-lg">
                  <h5 className="text-lg font-semibold text-mahjong-blue-300 mb-2">順子（シュンツ）</h5>
                  <p className="text-base mb-2">連続する3つの数牌</p>
                  <div className="flex justify-center space-x-1">
                    {['1m', '2m', '3m'].map((tile) => (
                      <div key={tile} className="relative w-8 h-12">
                        <Image
                          src={getTileImagePath(tile)}
                          alt={tile}
                          fill
                          className="object-contain"
                          priority={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-mahjong-green-500/20 p-3 rounded-lg">
                  <h5 className="text-lg font-semibold text-mahjong-green-300 mb-2">刻子（コーツ）</h5>
                  <p className="text-base mb-2">同じ牌3つ</p>
                  <div className="flex justify-center space-x-1">
                    {['白', '白', '白'].map((tile, index) => (
                      <div key={`${tile}-${index}`} className="relative w-8 h-12">
                        <Image
                          src={getTileImagePath(tile)}
                          alt={tile}
                          fill
                          className="object-contain"
                          priority={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* このゲームのルール */}
            <div className="bg-mahjong-gold-500/20 p-4 rounded-xl border-2 border-mahjong-gold-400/30">
              <h4 className="text-xl font-semibold text-mahjong-gold-300 mb-2">このゲームのルール</h4>
              <div className="space-y-2 text-base">
                <p>• 13枚の手札を選択してゲーム開始</p>
                <p>• 相手に上がられないように牌を捨てる</p>
                <p>• 上がったらポイント獲得</p>
                <p>• 先に5ポイント獲得した方が勝利</p>
              </div>
            </div>
          </div>
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
