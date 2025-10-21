'use client';

import { ReactNode, useState } from 'react';

interface CustomTooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
}

export function CustomTooltip({ children, content, className = '' }: CustomTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 px-6 py-3 text-xl font-bold text-white bg-gray-800 rounded-xl shadow-2xl whitespace-nowrap transform -translate-x-1/2 -translate-y-full top-0 left-1/2 mb-3 border-2 border-gray-600">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
