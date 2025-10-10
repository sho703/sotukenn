'use client';

import { ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface HintPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | ReactNode;
  children: ReactNode;
}

export function HintPopup({ isOpen, onClose, title, children }: HintPopupProps) {
  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 背景スクロール防止
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 sm:mx-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="border-b border-gray-200 p-6 sm:p-8 flex items-center justify-between">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-4xl leading-none p-2"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* フッター */}
        <div className="border-t border-gray-200 p-6 sm:p-8 flex justify-center flex-shrink-0">
          <Button
            onClick={onClose}
            className="px-12 py-6 text-2xl sm:text-3xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            閉じる
          </Button>
        </div>
      </div>
    </div>
  );
}


