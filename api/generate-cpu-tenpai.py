from http.server import BaseHTTPRequestHandler
import json
import sys
import random

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            tiles = data.get('tiles', [])
            dora = data.get('dora', '')
            
            # CPUの手札をランダムに生成（簡易版）
            all_tiles = [
                '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
                '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p',
                '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s',
                '東', '南', '西', '北', '白', '發', '中'
            ]
            
            # 既に使用されている牌を除外
            available_tiles = [tile for tile in all_tiles if tile not in tiles]
            
            # 13枚の手札をランダムに選択
            cpu_hand = random.sample(available_tiles, min(13, len(available_tiles)))
            
            # 和了牌をランダムに選択
            winning_tile = random.choice(all_tiles)
            
            result = {
                "handTiles": cpu_hand,
                "winningTile": winning_tile
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            error_result = {
                "error": str(e)
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_result).encode('utf-8'))
