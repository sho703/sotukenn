from http.server import BaseHTTPRequestHandler
import json
import sys

# mahjongライブラリのインポート
try:
    from mahjong.hand import Hand
    from mahjong.tile import TilesConverter
    from mahjong.shanten import Shanten
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
            dora = data.get('dora', '')
            
            # 牌をmahjongライブラリの形式に変換
            converted_tiles = self.convert_tiles(tiles)
            
            # 手牌を作成
            hand = Hand(converted_tiles)
            
            # 聴牌判定
            shanten = Shanten()
            shanten_count = shanten.calculate_shanten(hand.tiles)
            is_tenpai = shanten_count == 0
            
            # 待ち牌の計算（簡易版）
            waiting_tiles = []
            if is_tenpai:
                # 実際の待ち牌計算は複雑なので、簡易的に実装
                waiting_tiles = self.get_waiting_tiles(hand.tiles)
            
            result = {
                "isTenpai": is_tenpai,
                "waitingTiles": waiting_tiles
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))
            
        except Exception as e:
            error_result = {
                "error": str(e),
                "isTenpai": False
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
    
    def get_waiting_tiles(self, tiles):
        """待ち牌を計算（簡易版）"""
        # 実際の実装は複雑なので、空の配列を返す
        return []
