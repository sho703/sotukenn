'use client';

import { Button } from "@/components/ui/button";

interface Props {
  onDeal: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasDealt: boolean; // 配牌が行われたかどうか
}

export function GameHeader({ onDeal, onAnalyze, isAnalyzing, hasDealt }: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">2人麻雀</h1>
      <div className="space-x-2">
        <Button
          onClick={onDeal}
          variant="outline"
          disabled={isAnalyzing}
        >
          配牌する
        </Button>
        <Button
          onClick={onAnalyze}
          disabled={!hasDealt || isAnalyzing}
        >
          {isAnalyzing ? '分析中...' : '聴牌形提案'}
        </Button>
      </div>
    </div>
  );
} 