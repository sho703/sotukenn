# 🚀 Render デプロイ手順

このガイドに従って、Renderでアプリケーションをデプロイします。

## 📋 前提条件

1. **Renderアカウント**: [render.com](https://render.com)でアカウントを作成
2. **GitHubリポジトリ**: コードがGitHubにプッシュされていること
3. **Gemini APIキー**: [Google AI Studio](https://makersuite.google.com/app/apikey)で取得

## 🎯 デプロイ手順

### ステップ1: Python APIバックエンドのデプロイ

1. **Renderダッシュボードにアクセス**
   - https://dashboard.render.com にログイン

2. **新しいWebサービスを作成**
   - 「New +」ボタンをクリック
   - 「Web Service」を選択

3. **リポジトリを接続**
   - GitHubリポジトリを選択
   - または、リポジトリURLを入力

4. **サービス設定を入力**
   ```
   Name: mahjong-api
   Environment: Python 3
   Region: お好みのリージョン（例: Singapore）
   Branch: main（またはメインブランチ）
   ```

5. **ビルドコマンド**
   ```
   pip install -r requirements.txt
   ```

6. **スタートコマンド**
   ```
   python api_server.py
   ```

7. **環境変数を設定**
   - `PYTHON_VERSION`: `3.9.0`

8. **「Create Web Service」をクリック**
   - デプロイが開始されます
   - デプロイ完了まで待機（約5-10分）

9. **API URLをメモ**
   - デプロイ完了後、表示されるURLをメモ（例: `https://mahjong-api.onrender.com`）
   - このURLは次のステップで使用します

### ステップ2: Next.jsフロントエンドのデプロイ

1. **新しいWebサービスを作成**
   - 「New +」ボタンをクリック
   - 「Web Service」を選択

2. **同じリポジトリを選択**

3. **サービス設定を入力**
   ```
   Name: mahjong-frontend
   Environment: Node
   Region: Python APIと同じリージョン
   Branch: main（またはメインブランチ）
   ```

4. **ビルドコマンド**
   ```
   npm install && npm run build
   ```

5. **スタートコマンド**
   ```
   npm start
   ```

6. **環境変数を設定**
   - `NODE_ENV`: `production`
   - `PYTHON_API_URL`: ステップ1でメモしたAPI URL（例: `https://mahjong-api.onrender.com`）
   - `GEMINI_API_KEY`: あなたのGemini APIキー

7. **「Create Web Service」をクリック**
   - デプロイが開始されます

### ステップ3: デプロイの確認

1. **Python APIの確認**
   - ブラウザで `https://mahjong-api.onrender.com/health` にアクセス
   - `{"status":"healthy"}` が表示されればOK

2. **フロントエンドの確認**
   - フロントエンドサービスのURLにアクセス
   - ゲームが正常に動作するか確認

## 🔧 トラブルシューティング

### Python APIが起動しない

**エラー: ModuleNotFoundError**
- `requirements.txt`にすべての依存関係が含まれているか確認
- Build Logでエラーを確認

**エラー: Port already in use**
- `api_server.py`が環境変数`PORT`を使用しているか確認

### フロントエンドからAPIに接続できない

**エラー: Network Error**
- `PYTHON_API_URL`環境変数が正しく設定されているか確認
- Python APIサービスのURLが正しいか確認（末尾に`/`は不要）
- CORS設定を確認（`api_server.py`で`allow_origins=["*"]`になっているか）

### ビルドエラー

**エラー: Next.js build failed**
- Node.jsのバージョンを確認（Next.js 15にはNode.js 18以上が必要）
- Build Logで詳細なエラーを確認

**エラー: npm install failed**
- `package.json`の依存関係を確認
- Build Logで詳細なエラーを確認

### 環境変数が設定されていない

- Renderダッシュボードの「Environment」タブで環境変数を確認
- 環境変数名が正しいか確認（大文字・小文字に注意）

## 📝 デプロイ後の設定

### CORS設定の最適化（オプション）

本番環境では、CORS設定を特定のドメインに制限することを推奨します。

`api_server.py`の以下の部分を修正：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://mahjong-frontend.onrender.com"],  # フロントエンドのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🎉 デプロイ完了

デプロイが完了したら、フロントエンドのURLからゲームをプレイできます！

## 📚 参考リンク

- [Render公式ドキュメント](https://render.com/docs)
- [FastAPI公式ドキュメント](https://fastapi.tiangolo.com/)
- [Next.js公式ドキュメント](https://nextjs.org/docs)

