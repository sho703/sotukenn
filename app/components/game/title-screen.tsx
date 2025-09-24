'use client';

import { Button } from "@/components/ui/button";

interface Props {
  onStartGame: () => void;
}

export function TitleScreen({ onStartGame }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            🀄 2人麻雀
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            先に5ポイント獲得したプレイヤーの勝利！
          </p>
        </div>

        <Button
          onClick={onStartGame}
          size="lg"
          className="px-12 py-4 text-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          ゲームスタート
        </Button>
      </div>
    </div>
  );
}
