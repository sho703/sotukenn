#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
from mahjong.hand_calculating.hand import HandCalculator
from mahjong.tile import TilesConverter
from mahjong.hand_calculating.hand_config import HandConfig

def convert_our_format_to_mahjong_lib(tiles, last_tile):
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
    
    # 全ての牌（手牌 + 和了牌）を変換
    all_tiles = tiles + [last_tile]
    
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

def get_win_tile_index(last_tile, tiles_136):
    """
    和了牌のインデックスを取得
    """
    # 和了牌の種類を判定
    if last_tile.endswith('m'):
        base = (int(last_tile[0]) - 1) * 4
    elif last_tile.endswith('p'):
        base = 36 + (int(last_tile[0]) - 1) * 4
    elif last_tile.endswith('s'):
        base = 72 + (int(last_tile[0]) - 1) * 4
    elif last_tile in ['東', '南', '西', '北', '白', '發', '中']:
        honor_map = {'東': 0, '南': 1, '西': 2, '北': 3, '白': 4, '發': 5, '中': 6}
        base = 108 + honor_map[last_tile] * 4
    elif last_tile.endswith('z'):
        base = 108 + (int(last_tile[0]) - 1) * 4
    else:
        raise ValueError(f"不正な和了牌: {last_tile}")
    
    # その種類の牌で使用されているインデックスを探す
    for i in range(base, base + 4):
        if i < len(tiles_136) and tiles_136[i] == 1:
            return i
    
    # 見つからない場合は最初のインデックス
    return base

def check_win(tiles, last_tile, dora):
    """
    mahjongライブラリを使用して和了判定を実行
    """
    try:
        converter = TilesConverter()
        calculator = HandCalculator()
        
        # 牌を変換
        man_str, pin_str, sou_str, honors_str = convert_our_format_to_mahjong_lib(tiles, last_tile)
        
        # 136形式に変換
        tiles_136 = converter.string_to_136_array(
            man=man_str,
            pin=pin_str,
            sou=sou_str,
            honors=honors_str
        )
        
        # 和了牌のインデックスを取得
        win_tile_index = get_win_tile_index(last_tile, tiles_136)
        
        # ドラ表示牌を変換
        dora_man, dora_pin, dora_sou, dora_honors = convert_our_format_to_mahjong_lib([], dora)
        dora_136 = converter.string_to_136_array(
            man=dora_man,
            pin=dora_pin, 
            sou=dora_sou,
            honors=dora_honors
        )
        # TilesConverterは直接インデックスリストを返す
        dora_indicators = dora_136 if isinstance(dora_136, list) and all(isinstance(x, int) for x in dora_136) else [i for i, x in enumerate(dora_136) if x == 1]
        
        # 和了判定を実行（プレイヤーは常時リーチ状態）
        config = HandConfig(
            is_tsumo=False,  # ロン和了
            is_riichi=True   # プレイヤーは常時リーチ状態
        )
        
        result = calculator.estimate_hand_value(
            tiles=tiles_136,
            win_tile=win_tile_index,
            melds=[],
            dora_indicators=dora_indicators,
            config=config
        )
        
        if result.error:
            return {
                "isWinning": False,
                "error": result.error
            }
        
        # 役名をそのまま使用
        yaku_names = []
        if result.yaku:
            for yaku_item in result.yaku:
                yaku_names.append(yaku_item.name)
        
        return {
            "isWinning": True,
            "points": result.cost['main'] if result.cost else 0,
            "han": result.han,
            "fu": result.fu,
            "yaku": yaku_names
        }
        
    except Exception as e:
        return {
            "isWinning": False,
            "error": f"和了判定エラー: {str(e)}"
        }

def check_tenpai(tiles):
    """
    手牌が聴牌状態かどうかをチェックし、待ち牌を返す
    """
    try:
        calculator = HandCalculator()
        
        # 手牌を136形式に変換
        converter = TilesConverter()
        man_str, pin_str, sou_str, honors_str = convert_our_format_to_mahjong_lib(tiles, "")
        tiles_136 = converter.string_to_136_array(
            man=man_str,
            pin=pin_str,
            sou=sou_str,
            honors=honors_str
        )
        
        # 可能な全ての牌（1-9萬筒索、東南西北白發中）で和了判定を試す
        all_possible_tiles = []
        
        # 萬子・筒子・索子（1-9）
        for suit in ['m', 'p', 's']:
            for num in range(1, 10):
                all_possible_tiles.append(f"{num}{suit}")
        
        # 字牌
        honor_tiles = ['東', '南', '西', '北', '白', '發', '中']
        all_possible_tiles.extend(honor_tiles)
        
        waiting_tiles = []
        
        for test_tile in all_possible_tiles:
            try:
                # テスト用の和了牌を136形式に変換
                test_man_str, test_pin_str, test_sou_str, test_honors_str = convert_our_format_to_mahjong_lib([test_tile], "")
                test_tiles_136 = converter.string_to_136_array(
                    man=test_man_str,
                    pin=test_pin_str,
                    sou=test_sou_str,
                    honors=test_honors_str
                )
                win_tile_index = -1
                for i, count in enumerate(test_tiles_136):
                    if count == 1:
                        win_tile_index = i
                        break
                
                if win_tile_index == -1:
                    continue
                
                # 和了判定を実行
                result = calculator.estimate_hand_value(
                    tiles=tiles_136,
                    win_tile=win_tile_index,
                    melds=[],
                    dora_indicators=[],
                    config=HandConfig(is_tsumo=False, is_riichi=False)
                )
                
                if result.hand_value:
                    waiting_tiles.append(test_tile)
                    
            except Exception:
                continue
        
        return {
            "isTenpai": len(waiting_tiles) > 0,
            "waitingTiles": waiting_tiles
        }
        
    except Exception as e:
        return {
            "isTenpai": False,
            "waitingTiles": [],
            "error": f"聴牌判定エラー: {str(e)}"
        }

def main():
    try:
        # コマンドライン引数からJSONを取得
        if len(sys.argv) != 2:
            raise ValueError("引数が不正です")
        
        input_data = json.loads(sys.argv[1])
        action = input_data.get('action', 'check_win')
        
        if action == 'check_tenpai':
            # 聴牌判定
            tiles = input_data['tiles']
            result = check_tenpai(tiles)
        else:
            # 和了判定
            tiles = input_data['tiles']
            last_tile = input_data['lastTile']
            dora = input_data['dora']
            result = check_win(tiles, last_tile, dora)
        
        # 結果をJSONで出力
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        error_result = {
            "isWinning": False,
            "isTenpai": False,
            "error": str(e)
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()