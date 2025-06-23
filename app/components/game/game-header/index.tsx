export function GameHeader() {
  return (
    <header className="w-full flex flex-col items-center justify-center py-4 mb-4 bg-gray-50 border-b">
      <h1 className="text-2xl font-bold mb-1 text-gray-600">麻雀MVP - 配牌選択デモ</h1>
      <p className="text-gray-600 text-sm">
        グリッドの牌から手牌ゾーンに13枚ドラッグ＆ドロップしてください。ドラも同時に表示されます。
      </p>
    </header>
  );
} 