'use client';

import React from 'react';
import { TutorialGameBoard } from './components/tutorial-game-board';

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mahjong-table-600 via-mahjong-table-700 to-mahjong-table-800">
      <TutorialGameBoard />
    </div>
  );
}
