#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
麻雀ライブラリのセットアップスクリプト
"""

import subprocess
import sys
import os

def install_requirements():
    """必要なPythonパッケージをインストール"""
    try:
        print("mahjongライブラリをインストール中...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", 
            os.path.join(os.path.dirname(__file__), "requirements.txt")
        ])
        print("✅ インストール完了")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ インストールに失敗しました: {e}")
        return False

def test_mahjong_library():
    """mahjongライブラリのテスト"""
    try:
        print("mahjongライブラリをテスト中...")
        
        # 簡単なテスト
        from mahjong.hand_calculating.hand import HandCalculator
        from mahjong.tile import TilesConverter
        
        calculator = HandCalculator()
        converter = TilesConverter()
        
        # テスト用の手牌（国士無双）
        tiles = converter.string_to_136_array(man='19', pin='19', sou='19', honors='1234567')
        win_tile = converter.string_to_34_array(honors='7')[6] * 4
        
        print("✅ mahjongライブラリが正常に動作しています")
        return True
        
    except ImportError as e:
        print(f"❌ mahjongライブラリのインポートに失敗: {e}")
        return False
    except Exception as e:
        print(f"❌ テストに失敗: {e}")
        return False

def main():
    print("=== 麻雀ライブラリセットアップ ===")
    
    # Python バージョンチェック
    if sys.version_info < (3, 6):
        print("❌ Python 3.6以上が必要です")
        sys.exit(1)
    
    print(f"✅ Python {sys.version}")
    
    # パッケージインストール
    if not install_requirements():
        sys.exit(1)
    
    # ライブラリテスト
    if not test_mahjong_library():
        sys.exit(1)
    
    print("\n🎉 セットアップが完了しました！")
    print("Next.jsアプリケーションから和了判定が利用できます。")

if __name__ == "__main__":
    main()

