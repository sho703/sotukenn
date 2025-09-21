#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from mahjong.hand_calculating.hand import HandCalculator
from mahjong.tile import TilesConverter
from mahjong.hand_calculating.hand_config import HandConfig

def test_library_usage():
    """ライブラリの基本的な使用方法をテスト"""
    try:
        converter = TilesConverter()
        calculator = HandCalculator()
        
        print("=== TilesConverter テスト ===")
        
        # 基本的な変換テスト
        tiles_34 = converter.string_to_34_array(man='123456789', pin='123', sou='11')
        print(f"34形式: {tiles_34}")
        
        tiles_136 = converter.string_to_136_array(man='123456789', pin='123', sou='11')
        print(f"136形式の合計: {sum(tiles_136)}")
        print(f"136形式の長さ: {len(tiles_136)}")
        
        # 手牌の枚数確認
        total_tiles = sum(tiles_34)
        print(f"手牌の総数: {total_tiles}")
        
        # 正しい14枚の手牌を作成
        if total_tiles == 14:
            print("✅ 14枚の手牌が正しく作成されました")
            
            # 和了判定を試行
            config = HandConfig(is_tsumo=True)  # ツモ和了で試行
            
            # 和了牌は手牌に含まれている最後の牌
            win_tile = None
            for i in range(len(tiles_136)):
                if tiles_136[i] == 1:
                    win_tile = i
                    break
            
            if win_tile is not None:
                result = calculator.estimate_hand_value(
                    tiles=tiles_136,
                    win_tile=win_tile,
                    melds=[],
                    dora_indicators=[],
                    config=config
                )
                
                print(f"\n和了判定結果:")
                print(f"エラー: {result.error}")
                print(f"和了: {result.error is None}")
                
                if result.error is None:
                    print(f"飜数: {result.han}")
                    print(f"符数: {result.fu}")
                    print(f"点数: {result.cost}")
                    print(f"役: {[yaku.name for yaku in result.yaku] if result.yaku else []}")
                    return True
                else:
                    print(f"和了失敗理由: {result.error}")
            else:
                print("和了牌が見つかりません")
        else:
            print(f"❌ 手牌の枚数が不正です: {total_tiles}枚")
        
        return False
        
    except Exception as e:
        print(f"エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_library_usage()

