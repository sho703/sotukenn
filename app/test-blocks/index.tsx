'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TestBlocksIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8 font-japanese">
          5ブロック理論テストページ
        </h1>

        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-mahjong-gold-400/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-japanese text-center">
            5ブロック理論とは？
          </h2>
          <p className="text-white text-lg mb-4">
            麻雀の5ブロック理論とは、和了牌が完成するのに必要な「雀頭1組」と「メンツ4組」の合計5つのまとまり（ブロック）を目指す手組みの考え方です。
          </p>
          <p className="text-white text-lg mb-4">
            イーシャンテン（和了まであと1枚牌を引けばテンパイ）の段階で受け入れ（待ちの枚数）を最大化し、テンパイまでのスピードを速めることを目的とします。
          </p>
          <p className="text-white text-lg">
            迷った場合はまず5ブロックを意識することが無難とされます。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 基本版 */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
            <h3 className="text-xl font-bold text-white mb-4 font-japanese text-center">
              基本版
            </h3>
            <p className="text-white mb-4">
              5つのブロックを表示し、牌をクリックで配置する基本的な実装です。
            </p>
            <ul className="text-white text-sm mb-6 space-y-1">
              <li>• 5つのブロック枠表示</li>
              <li>• クリックで牌を配置</li>
              <li>• シンプルな操作</li>
            </ul>
            <Link href="/test-blocks/page">
              <Button variant="mahjong" className="w-full">
                基本版をテスト
              </Button>
            </Link>
          </div>

          {/* ドラッグ&ドロップ版 */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
            <h3 className="text-xl font-bold text-white mb-4 font-japanese text-center">
              ドラッグ&ドロップ版
            </h3>
            <p className="text-white mb-4">
              ドラッグ&ドロップで牌を移動させる直感的な実装です。
            </p>
            <ul className="text-white text-sm mb-6 space-y-1">
              <li>• ドラッグ&ドロップ操作</li>
              <li>• 視覚的フィードバック</li>
              <li>• 進捗表示</li>
            </ul>
            <Link href="/test-blocks/drag-drop">
              <Button variant="mahjong" className="w-full">
                ドラッグ&ドロップ版をテスト
              </Button>
            </Link>
          </div>

          {/* ステップバイステップ版 */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30">
            <h3 className="text-xl font-bold text-white mb-4 font-japanese text-center">
              ステップバイステップ版
            </h3>
            <p className="text-white mb-4">
              段階的にブロックを完成させる初心者向けの実装です。
            </p>
            <ul className="text-white text-sm mb-6 space-y-1">
              <li>• 段階的なブロック作成</li>
              <li>• ステップごとのガイド</li>
              <li>• 初心者向け設計</li>
            </ul>
            <Link href="/test-blocks/step-by-step">
              <Button variant="mahjong" className="w-full">
                ステップバイステップ版をテスト
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-mahjong-gold-400/30 mt-8">
          <h3 className="text-xl font-bold text-white mb-4 font-japanese text-center">
            テストの目的
          </h3>
          <ul className="text-white space-y-2">
            <li>• 高齢の初心者にとってどの方式が分かりやすいか</li>
            <li>• 操作の直感性と学習効果</li>
            <li>• 既存のゲームUIとの統合可能性</li>
            <li>• 5ブロック理論の理解促進効果</li>
          </ul>
        </div>

        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="mahjong">
              メインゲームに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
