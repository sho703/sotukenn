'use client';

import { ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TutorialPopupProps {
  isOpen: boolean;
  onNext: () => void;
  title: string | ReactNode;
  children: ReactNode;
  showNextButton?: boolean;
  nextButtonText?: string;
}

export function TutorialPopup({
  isOpen,
  onNext,
  title,
  children,
  showNextButton = true,
  nextButtonText = '次へ →'
}: TutorialPopupProps) {
  // ESCキーは無効化（必ず次へボタンで進む）
  useEffect(() => {
    if (isOpen) {
      // 背景スクロール防止
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-in fade-in duration-200"
    // 背景クリックでは閉じない
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 sm:mx-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* ヘッダー */}
        <div className="border-b border-gray-200 p-6 sm:p-8 flex items-center justify-between">
          <h2 className="text-3xl sm:text-4xl font-bold text-black font-japanese">
            {title}
          </h2>
        </div>

        {/* コンテンツ */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* フッター */}
        {showNextButton && (
          <div className="border-t border-gray-200 p-6 sm:p-8 flex justify-center flex-shrink-0">
            <Button
              onClick={onNext}
              className="px-12 py-6 text-2xl sm:text-3xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-mahjong-gold-600 to-mahjong-gold-700 text-black border-2 border-mahjong-gold-400/50"
              size="lg"
            >
              {nextButtonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
