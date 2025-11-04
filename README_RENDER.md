# Render デプロイガイド

このプロジェクトをRenderでデプロイする方法を説明します。

## 📋 構成

Renderでは以下の2つのサービスをデプロイします：

1. **Next.jsフロントエンド** - Webサービス
2. **Python APIバックエンド** - FastAPIサーバー

## 🚀 デプロイ手順

### 1. Renderアカウントの準備

1. [Render](https://render.com)にアカウントを作成
2. GitHubリポジトリを接続

### 2. Python APIバックエンドのデプロイ

1. Renderダッシュボードで「New Web Service」をクリック
2. リポジトリを選択
3. 以下の設定を入力：

   **基本設定:**
   - **Name**: `mahjong-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python api_server.py`

   **環境変数:**
   - `PYTHON_VERSION`: `3.9.0`

4. 「Create Web Service」をクリック

### 3. Next.jsフロントエンドのデプロイ

1. Renderダッシュボードで「New Web Service」をクリック
2. 同じリポジトリを選択
3. 以下の設定を入力：

   **基本設定:**
   - **Name**: `mahjong-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

   **環境変数:**
   - `NODE_ENV`: `production`
   - `PYTHON_API_URL`: Python APIサービスのURL（例: `https://mahjong-api.onrender.com`）
   - `GEMINI_API_KEY`: あなたのGemini APIキー

4. 「Create Web Service」をクリック

### 4. 自動デプロイ設定（オプション）

`render.yaml`を使用して自動デプロイを設定することもできます：

1. リポジトリのルートに`render.yaml`を配置（既に作成済み）
2. Renderダッシュボードで「New Blueprint」を選択
3. リポジトリを選択
4. 「Apply」をクリック

## 🔧 ローカル開発環境でのテスト

Python APIサーバーをローカルで起動する場合：

```bash
# Python依存関係のインストール
pip install -r requirements.txt

# APIサーバーを起動
python api_server.py
```

Next.jsアプリを起動する場合：

```bash
# 環境変数を設定
export PYTHON_API_URL=http://localhost:8000

# Next.jsアプリを起動
npm run dev
```

## 📝 注意事項

1. **無料プランの制限**: Renderの無料プランでは、一定時間アクセスがないとサービスがスリープします。最初のリクエストが遅くなる可能性があります。

2. **CORS設定**: 本番環境では、`api_server.py`のCORS設定を特定のドメインに制限することを推奨します：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.onrender.com"],
    # ...
)
```

3. **環境変数**: `PYTHON_API_URL`は、Python APIサービスの完全なURLを設定してください（例: `https://mahjong-api.onrender.com`）。

## 🐛 トラブルシューティング

### Python APIが起動しない

- `requirements.txt`にすべての依存関係が含まれているか確認
- Build Logでエラーを確認
- Python 3.9が使用されているか確認

### フロントエンドからAPIに接続できない

- `PYTHON_API_URL`環境変数が正しく設定されているか確認
- Python APIサービスのURLが正しいか確認
- CORS設定を確認

### ビルドエラー

- Node.jsのバージョンを確認（Next.js 15にはNode.js 18以上が必要）
- `package.json`の依存関係を確認

