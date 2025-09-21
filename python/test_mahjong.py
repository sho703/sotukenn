#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from mahjong.hand_calculating.hand import HandCalculator
from mahjong.tile import TilesConverter
from mahjong.hand_calculating.hand_config import HandConfig

def test_winning_hand():
    """確実に和了となる手牌でテスト"""
    try:
        converter = TilesConverter()
        calculator = HandCalculator()
        
        # 確実な和了形: 123456789m + 123p + 11s (平和 + 断ヤオ九)
        # 手牌13枚: 12345678m + 123p + 11s
        # 和了牌: 9m
        
        hand_tiles = converter.string_to_136_array(
            man='12345678',
            pin='123', 
            sou='11'
        )
        
        # 9mで和了
        win_tile_34 = converter.string_to_34_array(man='9')
        win_tile = next(i for i, x in enumerate(win_tile_34) if x > 0) * 4
        
        config = HandConfig(is_tsumo=False)
        
        result = calculator.estimate_hand_value(
            tiles=hand_tiles,
            win_tile=win_tile,
            melds=[],
            dora_indicators=[],
            config=config
        )
        
        print("=== 和了テスト結果 ===")
        print(f"手牌: 12345678m + 123p + 11s")
        print(f"和了牌: 9m")
        print(f"エラー: {result.error}")
        print(f"和了: {result.error is None}")
        
        if result.error is None:
            print(f"飜数: {result.han}")
            print(f"符数: {result.fu}")
            print(f"点数: {result.cost}")
            print(f"役: {[yaku.name for yaku in result.yaku] if result.yaku else []}")
            return True
        else:
            print(f"和了失敗: {result.error}")
            return False
        
    except Exception as e:
        print(f"テストエラー: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_simple_winning():
    """最もシンプルな和了形でテスト"""
    try:
        converter = TilesConverter()
        calculator = HandCalculator()
        
        # 非常にシンプル: 東東東 + 南南南 + 西西西 + 北北 + 北 (字牌のみ)
        tiles_136 = converter.string_to_136_array(
            man='',
            pin='',
            sou='',
            honors='1112223334'
        )
        
        # 4z(北)で和了
        win_tile = converter.string_to_136_array(honors='4')[0]
        
        config = HandConfig(is_tsumo=False)
        
        result = calculator.estimate_hand_value(
            tiles=tiles_136,
            win_tile=win_tile,
            melds=[],
            dora_indicators=[],
            config=config
        )
        
        print("\n=== シンプル和了テスト ===")
        print(f"手牌: 東東東南南南西西西北北")
        print(f"和了牌: 北")
        print(f"エラー: {result.error}")
        print(f"和了: {result.error is None}")
        
        if result.error is None:
            print(f"飜数: {result.han}")
            print(f"符数: {result.fu}")
            print(f"点数: {result.cost}")
            print(f"役: {[yaku.name for yaku in result.yaku] if result.yaku else []}")
            return True
        else:
            print(f"和了失敗: {result.error}")
            return False
        
    except Exception as e:
        print(f"シンプルテストエラー: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("mahjongライブラリの動作テスト")
    
    success1 = test_winning_hand()
    success2 = test_simple_winning()
    
    if success1 or success2:
        print("\n✅ テストが成功しました")
    else:
        print("\n❌ すべてのテストが失敗しました")