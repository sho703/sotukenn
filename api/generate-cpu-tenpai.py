#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import os

# pythonディレクトリのパスを追加
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'python'))

from cpu_tenpai_generator import generate_cpu_tenpai

def handler(request):
    """
    VercelのPythonサーバーレス関数のハンドラ
    requestはVercelのRequestオブジェクトまたはdict
    """
    try:
        # リクエストボディを取得
        if hasattr(request, 'body'):
            # VercelのRequestオブジェクトの場合
            if isinstance(request.body, str):
                body = json.loads(request.body)
            else:
                body = request.body
        elif hasattr(request, 'json'):
            body = request.json()
        elif isinstance(request, dict):
            body = request
        elif isinstance(request, str):
            body = json.loads(request)
        else:
            # デフォルト: requestをそのまま使用
            body = request
        
        tiles = body.get('tiles') if isinstance(body, dict) else None
        dora = body.get('dora') if isinstance(body, dict) else None
        force_chiitoitsu = body.get('forceChiitoitsu', False) if isinstance(body, dict) else False
        
        if not tiles or not dora:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Missing required parameters (tiles, dora)'
                }, ensure_ascii=False)
            }
        
        # CPU聴牌形を生成
        result = generate_cpu_tenpai(tiles, dora, force_chiitoitsu)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result, ensure_ascii=False)
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': f'Internal server error: {str(e)}',
                'trace': error_trace,
                'success': False
            }, ensure_ascii=False)
        }

