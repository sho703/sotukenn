#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
from mahjong.hand_calculating.hand import HandCalculator
from mahjong.tile import TilesConverter
from mahjong.hand_calculating.hand_config import HandConfig

def convert_our_format_to_mahjong_lib(tiles, last_tile=None):
    """
    我々の牌形式をmahjongライブラリの形式に変換
    """
    # 字牌の変換マップ
    honor_map = {
        '東': '1',
        '南': '2', 
        '西': '3',
        '北': '4',
        '白': '5',
        '發': '6',
        '発': '6',  # 発と發の両方に対応
        '中': '7'
    }
    
    # 全ての牌を変換
    all_tiles = tiles + ([last_tile] if last_tile else [])
    
    man_tiles = []
    pin_tiles = []
    sou_tiles = []
    honor_tiles = []
    
    for tile in all_tiles:
        if tile.endswith('m'):
            man_tiles.append(tile[0])
        elif tile.endswith('p'):
            pin_tiles.append(tile[0])
        elif tile.endswith('s'):
            sou_tiles.append(tile[0])
        elif tile in honor_map:
            honor_tiles.append(honor_map[tile])
        elif tile.endswith('z'):
            honor_tiles.append(tile[0])
    
    # ソートして文字列に変換
    man_str = ''.join(sorted(man_tiles))
    pin_str = ''.join(sorted(pin_tiles))
    sou_str = ''.join(sorted(sou_tiles))
    honors_str = ''.join(sorted(honor_tiles))
    
    return man_str, pin_str, sou_str, honors_str

def get_tile_index(tile):
    """
    牌のインデックスを取得
    """
    if tile.endswith('m'):
        return (int(tile[0]) - 1) * 4
    elif tile.endswith('p'):
        return 36 + (int(tile[0]) - 1) * 4
    elif tile.endswith('s'):
        return 72 + (int(tile[0]) - 1) * 4
    elif tile in ['東', '南', '西', '北', '白', '發', '中']:
        honor_map = {'東': 0, '南': 1, '西': 2, '北': 3, '白': 4, '發': 5, '中': 6}
        return 108 + honor_map[tile] * 4
    elif tile.endswith('z'):
        return 108 + (int(tile[0]) - 1) * 4
    else:
        raise ValueError(f"不正な牌: {tile}")

def check_tenpai(tiles, dora):
    """
    聴牌判定を実行
    """
    try:
        # 全ての牌をテストして聴牌をチェック
        waiting_tiles = []
        
        # 萬子
        for i in range(1, 10):
            tile = f"{i}m"
            if can_win_with_tile(tiles, tile, dora):
                waiting_tiles.append(tile)
        
        # 筒子
        for i in range(1, 10):
            tile = f"{i}p"
            if can_win_with_tile(tiles, tile, dora):
                waiting_tiles.append(tile)
        
        # 索子
        for i in range(1, 10):
            tile = f"{i}s"
            if can_win_with_tile(tiles, tile, dora):
                waiting_tiles.append(tile)
        
        # 字牌
        honor_tiles = ['東', '南', '西', '北', '白', '發', '中']
        for tile in honor_tiles:
            if can_win_with_tile(tiles, tile, dora):
                waiting_tiles.append(tile)
        
        return {
            "isTenpai": len(waiting_tiles) > 0,
            "waitingTiles": waiting_tiles
        }
        
    except Exception as e:
        return {
            "isTenpai": False,
            "error": f"聴牌判定エラー: {str(e)}"
        }

def can_win_with_tile(tiles, tile, dora):
    """
    既存のcheck_win関数を使用して和了判定
    """
    try:
        from mahjong_checker import check_win
        result = check_win(tiles, tile, dora)
        return result.get("isWinning", False)
    except Exception:
        return False

def check_winning_with_tile(tiles_136, tile, dora_indicators, calculator):
    """
    特定の牌で和了できるかチェック（未使用）
    """
    try:
        # 手牌に牌を追加
        test_tiles = tiles_136.copy()
        tile_index = get_tile_index(tile)
        
        # その種類の牌で使用されていないインデックスを探す
        for i in range(tile_index, tile_index + 4):
            if i < len(test_tiles) and test_tiles[i] == 0:
                test_tiles[i] = 1
                break
        else:
            # 見つからない場合は最初のインデックスを使用
            test_tiles[tile_index] = 1
        
        # 和了判定
        config = HandConfig(
            is_tsumo=False,  # ロン和了
            is_riichi=True   # プレイヤーは常時リーチ状態
        )
        
        result = calculator.estimate_hand_value(
            tiles=test_tiles,
            win_tile=tile_index,
            melds=[],
            dora_indicators=dora_indicators,
            config=config
        )
        
        return not result.error and result.han > 0
        
    except Exception:
        return False

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input data provided"}), ensure_ascii=False)
        sys.exit(1)
    
    input_data = json.loads(sys.argv[1])
    
    tiles = input_data.get('tiles')
    dora = input_data.get('dora')
    
    if not tiles or not dora:
        print(json.dumps({"error": "Missing required parameters (tiles, dora)"}), ensure_ascii=False)
        sys.exit(1)
    
    result = check_tenpai(tiles, dora)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
