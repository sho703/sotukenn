#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from mahjong.hand_calculating.hand import HandCalculator
from mahjong.tile import TilesConverter
from mahjong.hand_calculating.hand_config import HandConfig

def test_documented_example():
    """ドキュメントの例を参考にしたテスト"""
    try:
        calculator = HandCalculator()
        
        # ドキュメントの例: 手牌を直接136形式で指定
        # 123456789m123p11s の形
        tiles = [
            # 1-9m (萬子)
            0, 4, 8, 12, 16, 20, 24, 28, 32,
            # 1-3p (筒子) 
            36, 40, 44,
            # 1s x2 (索子)
            72, 73
        ]
        
        # 和了牌は9m
        win_tile = 32
        
        config = HandConfig(is_tsumo=False)
        
        result = calculator.estimate_hand_value(
            tiles=tiles,
            win_tile=win_tile,
            melds=[],
            dora_indicators=[],
            config=config
        )
        
        print("=== ドキュメント例テスト ===")
        print(f"手牌: {tiles}")
        print(f"和了牌: {win_tile}")
        print(f"エラー: {result.error}")
        print(f"和了: {result.error is None}")
        
        if result.error is None:
            print(f"飜数: {result.han}")
            print(f"符数: {result.fu}")
            print(f"点数: {result.cost}")
            print(f"役: {[yaku.name for yaku in result.yaku] if result.yaku else []}")
            return True
        else:
            print(f"失敗理由: {result.error}")
            return False
        
    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_converter_methods():
    """TilesConverterの各メソッドをテスト"""
    try:
        converter = TilesConverter()
        
        print("\n=== TilesConverter メソッドテスト ===")
        
        # 文字列から34形式
        tiles_34 = converter.string_to_34_array(man='123456789', pin='123', sou='11')
        print(f"string_to_34_array結果: 合計{sum(tiles_34)}枚")
        
        # 文字列から136形式  
        tiles_136 = converter.string_to_136_array(man='123456789', pin='123', sou='11')
        print(f"string_to_136_array結果: 合計{sum(tiles_136)}枚")
        
        # 136形式を34形式に変換
        converted_34 = converter.to_34_array(tiles_136)
        print(f"136→34変換結果: 合計{sum(converted_34)}枚")
        
        return True
        
    except Exception as e:
        print(f"Converterテストエラー: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_converter_methods()
    test_documented_example()

