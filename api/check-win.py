from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# mahjongライブラリのインポート
try:
    from mahjong.hand import Hand
    from mahjong.tile import TilesConverter
    from mahjong.meld import Meld
    from mahjong.agari import Agari
    from mahjong.shanten import Shanten
    from mahjong.yaku_checker import YakuChecker
    from mahjong.rule import Rule
except ImportError:
    print("mahjong library not available", file=sys.stderr)
    sys.exit(1)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            tiles = data.get('tiles', [])
            last_tile = data.get('lastTile', '')
            dora = data.get('dora', '')
            
            # 牌をmahjongライブラリの形式に変換
            converted_tiles = self.convert_tiles(tiles + [last_tile])
            
            # 手牌を作成
            hand = Hand(converted_tiles)
            
            # 和了判定
            agari = Agari()
            is_winning = agari.is_agari(hand.tiles)
            
            result = {
                "isWinning": is_winning,
                "points": 0,
                "yaku": [],
                "han": 0,
                "fu": 0
            }
            
            if is_winning:
                # 役のチェック
                yaku_checker = YakuChecker()
                rule = Rule()
                yaku_list = yaku_checker.check_yaku(hand, [], rule)
                
                if yaku_list:
                    result["yaku"] = [yaku.name for yaku in yaku_list]
                    result["han"] = sum([yaku.han for yaku in yaku_list])
                    result["points"] = result["han"] * 100  # 簡易的な点数計算
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            error_result = {
                "error": str(e),
                "isWinning": False
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(error_result).encode('utf-8'))
    
    def convert_tiles(self, tiles):
        """牌をmahjongライブラリの形式に変換"""
        converted = []
        for tile in tiles:
            if tile.endswith('m'):
                num = int(tile[0])
                converted.append(num)
            elif tile.endswith('p'):
                num = int(tile[0])
                converted.append(num + 10)
            elif tile.endswith('s'):
                num = int(tile[0])
                converted.append(num + 20)
            elif tile == '東':
                converted.append(31)
            elif tile == '南':
                converted.append(32)
            elif tile == '西':
                converted.append(33)
            elif tile == '北':
                converted.append(34)
            elif tile == '白':
                converted.append(35)
            elif tile == '發':
                converted.append(36)
            elif tile == '中':
                converted.append(37)
        return converted
