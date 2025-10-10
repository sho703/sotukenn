'use client';

import { Card, CardContent } from "@/components/ui/card"
import { getTileImagePath } from "@/app/lib/mahjong"
import Image from "next/image"
import { HintPopup } from "@/app/components/ui/hint-popup"
import { useState } from "react"

interface Props {
  dora: string;
}

export function DoraIndicator({ dora }: Props) {
  const tileImagePath = getTileImagePath(dora);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <Card
        className="bg-yellow-50 border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors"
        onClick={() => setIsPopupOpen(true)}
        title="クリックで説明を表示"
      >
        <CardContent className="flex items-center gap-2 p-3">
          <span className="font-bold text-gray-600">ドラ:</span>
          <div className="relative w-12 h-16">
            <Image
              src={tileImagePath}
              alt={`ドラ ${dora}`}
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
        </CardContent>
      </Card>

      <HintPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        title="🀄 ドラとは？"
      >
        <div className="space-y-6">
          <p className="text-2xl sm:text-3xl leading-relaxed text-gray-700">
            ドラは<span className="font-bold text-blue-600">「ボーナス牌」</span>です。
          </p>

          <p className="text-2xl sm:text-3xl leading-relaxed text-gray-700">
            手牌にドラが含まれていると、上がったときの<span className="font-bold text-red-600">得点が増えます。</span>
          </p>

          <div className="bg-yellow-50 rounded-xl p-6 sm:p-8 border-2 border-yellow-200">
            <p className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">今回のドラ：</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <div className="relative w-20 h-28 sm:w-24 sm:h-32">
                <Image
                  src={tileImagePath}
                  alt={`ドラ ${dora}`}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <p className="text-2xl sm:text-3xl text-gray-700 font-bold text-center">
                ← この牌がドラです
              </p>
            </div>
          </div>

          <p className="text-2xl sm:text-3xl leading-relaxed text-gray-700 font-bold">
            ドラ1枚につき、得点が<span className="text-red-600">1ポイント</span>増えます。
          </p>
        </div>
      </HintPopup>
    </>
  );
} 