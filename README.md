# 二人麻雀ゲーム

TypeScript/Next.js で作られた二人麻雀のWebアプリケーションです。

## 🎯 概要

オリジナルルールによる二人麻雀ゲーム。プレイヤー vs CPU の対戦形式で、Python mahjongライブラリを使用した正確な和了判定を実装しています。

## 🛠️ 技術スタック

- **Frontend**: Next.js 15.3.3 (App Router), React, TypeScript
- **UI**: Tailwind CSS, Shadcn UI, Radix UI
- **Drag & Drop**: DnD Kit
- **Backend**: Next.js API Routes
- **和了判定**: Python mahjong library
- **開発環境**: Node.js, npm

## 🚀 セットアップ

### 1. リポジトリのクローン
```bash
git clone https://github.com/sho703/sotukenn.git
cd sotukenn
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. Python環境のセットアップ
```bash
cd python
python setup.py
```

### 4. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてゲームをプレイできます。

## 📁 プロジェクト構造

```
├── app/
│   ├── components/game/     # ゲームコンポーネント
│   ├── hooks/              # カスタムフック
│   ├── api/                # API Routes
│   └── lib/                # ユーティリティ
├── python/                 # Python和了判定スクリプト
├── public/images/tiles/    # 麻雀牌画像
└── types/                  # TypeScript型定義
```

## 🎮 ゲームの遊び方

詳細なルールについては [GAME_RULES.md](./GAME_RULES.md) をご覧ください。

## 📊 開発進捗

開発の進捗状況については [PROGRESS.md](./PROGRESS.md) をご覧ください。

## 🔧 開発

### ビルド
```bash
npm run build
```

### 型チェック
```bash
npx tsc --noEmit
```

### Python和了判定のテスト
```bash
cd python
python mahjong_checker.py '{"tiles": ["1m","2m","3m","4m","5m","6m","7m","8m","9m","1p","1p","1p","1p"], "lastTile": "9m", "dora": "5s"}'
```

## 📝 ライセンス

このプロジェクトは学習目的で作成されています。

## 🤝 コントリビューション



---

**作成者**: sho703  
**リポジトリ**: https://github.com/sho703/sotukenn