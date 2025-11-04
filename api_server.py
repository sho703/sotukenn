#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPIサーバー - Render用のPython API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sys
import os

# pythonディレクトリのパスを追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python'))

from tenpai_checker import check_tenpai
from mahjong_checker import check_win
from cpu_tenpai_generator import generate_cpu_tenpai

app = FastAPI(title="Mahjong API", version="1.0.0")

# CORS設定（Next.jsからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では特定のドメインに制限してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# リクエストモデル
class TenpaiCheckRequest(BaseModel):
    tiles: List[str]
    dora: str

class WinCheckRequest(BaseModel):
    tiles: List[str]
    lastTile: str
    dora: str

class GenerateCpuTenpaiRequest(BaseModel):
    tiles: List[str]
    dora: str
    forceChiitoitsu: Optional[bool] = False

# ヘルスチェック
@app.get("/")
async def root():
    return {"status": "ok", "message": "Mahjong API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# 聴牌判定エンドポイント
@app.post("/api/check-tenpai")
async def check_tenpai_endpoint(request: TenpaiCheckRequest):
    try:
        if not request.tiles or len(request.tiles) != 13:
            raise HTTPException(status_code=400, detail="手牌は13枚である必要があります")
        
        if not request.dora:
            raise HTTPException(status_code=400, detail="ドラ表示牌が指定されていません")
        
        result = check_tenpai(request.tiles, request.dora)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"聴牌判定エラー: {str(e)}")

# 和了判定エンドポイント
@app.post("/api/check-win")
async def check_win_endpoint(request: WinCheckRequest):
    try:
        if not request.tiles or len(request.tiles) != 13:
            raise HTTPException(status_code=400, detail="手牌は13枚である必要があります")
        
        if not request.lastTile:
            raise HTTPException(status_code=400, detail="和了牌が指定されていません")
        
        if not request.dora:
            raise HTTPException(status_code=400, detail="ドラ表示牌が指定されていません")
        
        result = check_win(request.tiles, request.lastTile, request.dora)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"和了判定エラー: {str(e)}")

# CPU聴牌形生成エンドポイント
@app.post("/api/generate-cpu-tenpai")
async def generate_cpu_tenpai_endpoint(request: GenerateCpuTenpaiRequest):
    try:
        if not request.tiles:
            raise HTTPException(status_code=400, detail="牌が指定されていません")
        
        if not request.dora:
            raise HTTPException(status_code=400, detail="ドラ表示牌が指定されていません")
        
        result = generate_cpu_tenpai(request.tiles, request.dora, request.forceChiitoitsu)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CPU聴牌形生成エラー: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Renderは環境変数PORTを自動設定する
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

