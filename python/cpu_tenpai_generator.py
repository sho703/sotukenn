#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import sys
import random
from collections import Counter

def count_tiles(tiles):
    """牌の枚数をカウント"""
    return Counter(tiles)

def find_sequences(tiles):
    """順子を検出"""
    sequences = []
    tile_counts = count_tiles(tiles)
    
    # 数牌の順子を検索
    for suit in ['m', 'p', 's']:
        for i in range(1, 8):  # 1-7から順子開始
            if (f"{i}{suit}" in tile_counts and 
                f"{i+1}{suit}" in tile_counts and 
                f"{i+2}{suit}" in tile_counts):
                sequences.append([f"{i}{suit}", f"{i+1}{suit}", f"{i+2}{suit}"])
    
    return sequences

def find_triplets(tiles):
    """刻子を検出"""
    triplets = []
    tile_counts = count_tiles(tiles)
    
    for tile, count in tile_counts.items():
        if count >= 3:
            triplets.append([tile, tile, tile])
    
    return triplets

def find_pairs(tiles):
    """対子を検出"""
    pairs = []
    tile_counts = count_tiles(tiles)
    
    for tile, count in tile_counts.items():
        if count >= 2:
            pairs.append([tile, tile])
    
    return pairs

def find_taatsu(tiles):
    """ターツを検出"""
    taatsu = []
    tile_counts = count_tiles(tiles)
    
    # 数牌のターツ
    for suit in ['m', 'p', 's']:
        for i in range(1, 9):  # 1-8からターツ開始
            if (f"{i}{suit}" in tile_counts and 
                f"{i+1}{suit}" in tile_counts):
                taatsu.append([f"{i}{suit}", f"{i+1}{suit}"])
    
    return taatsu

def build_tenpai_hand(tiles):
    """聴牌形を構築（面子3組 + 対子1組 + ターツ1組）"""
    try:
        tile_counts = count_tiles(tiles)
        
        # 1. 刻子・順子を検出して面子リストに入れる
        melds = []
        
        # 刻子を検出
        for tile, count in tile_counts.items():
            if count >= 3:
                melds.append([tile, tile, tile])
        
        # 順子を検出
        for suit in ['m', 'p', 's']:
            for i in range(1, 8):
                if (tile_counts.get(f"{i}{suit}", 0) >= 1 and
                    tile_counts.get(f"{i+1}{suit}", 0) >= 1 and
                    tile_counts.get(f"{i+2}{suit}", 0) >= 1):
                    melds.append([f"{i}{suit}", f"{i+1}{suit}", f"{i+2}{suit}"])
        
        # 刻子検出で使った牌を除外
        remaining_tiles_for_pairs = []
        temp_counts = tile_counts.copy()
        for meld in melds:
            if len(meld) == 3 and meld[0] == meld[1] == meld[2]:  # 刻子
                temp_counts[meld[0]] -= 3
            elif len(meld) == 3:  # 順子
                for tile in meld:
                    temp_counts[tile] -= 1
        
        for tile, count in temp_counts.items():
            remaining_tiles_for_pairs.extend([tile] * count)
        
        # 2. 対子を検出して対子リストに入れる
        pairs = []
        pair_counts = count_tiles(remaining_tiles_for_pairs)
        for tile, count in pair_counts.items():
            if count >= 2:
                pairs.append([tile, tile])
        
        # 順子検出で使った牌を除外（刻子は既に除外済み）
        remaining_tiles_for_taatsu = []
        temp_counts_for_taatsu = tile_counts.copy()
        for meld in melds:
            if len(meld) == 3 and meld[0] != meld[1]:  # 順子のみ
                for tile in meld:
                    temp_counts_for_taatsu[tile] -= 1
        
        for tile, count in temp_counts_for_taatsu.items():
            remaining_tiles_for_taatsu.extend([tile] * count)
        
        # 3. ターツを検出してターツリストに入れる
        taatsu = []
        taatsu_counts = count_tiles(remaining_tiles_for_taatsu)
        for suit in ['m', 'p', 's']:
            for i in range(1, 9):
                if (taatsu_counts.get(f"{i}{suit}", 0) >= 1 and
                    taatsu_counts.get(f"{i+1}{suit}", 0) >= 1):
                    taatsu.append([f"{i}{suit}", f"{i+1}{suit}"])
        
        # 4. 面子リストから3つ、対子リストから1つ、ターツリストから1つ選ぶ
        if len(melds) < 3 or len(pairs) < 1 or len(taatsu) < 1:
            # エラー：必要な要素が不足 - 適当な13枚を返す
            return random.sample(tiles, min(13, len(tiles)))
        
        # ランダムに選択
        random.shuffle(melds)
        selected_melds = melds[:3]
        
        random.shuffle(pairs)
        selected_pair = pairs[0]
        
        random.shuffle(taatsu)
        selected_taatsu = taatsu[0]
        
        # 5. 13枚を完成させる
        hand = []
        for meld in selected_melds:
            hand.extend(meld)
        hand.extend(selected_pair)
        hand.extend(selected_taatsu)
        
        if len(hand) != 13:
            # エラー：13枚にならない - 適当な13枚を返す
            return random.sample(tiles, min(13, len(tiles)))
        
        return hand
        
    except Exception as e:
        # エラー時は適当な13枚を返す
        return random.sample(tiles, min(13, len(tiles)))

def build_chiitoitsu_hand(tiles):
    """七対子を構築（対子6組 + 単騎1枚）"""
    tile_counts = count_tiles(tiles)
    hand = []
    
    # 対子候補をリストアップ
    pair_candidates = []
    for tile, count in tile_counts.items():
        if count >= 2:
            pair_candidates.append(tile)
    
    # 対子をランダムに6組選択
    random.shuffle(pair_candidates)
    selected_pairs = pair_candidates[:6]
    
    for tile in selected_pairs:
        hand.extend([tile, tile])
        tile_counts[tile] -= 2  # 使用した分を減算
    
    # 単騎候補をリストアップ（対子で使用していない牌）
    tanki_candidates = []
    for tile, count in tile_counts.items():
        if count >= 1:
            tanki_candidates.append(tile)
    
    # 単騎をランダムに1枚選択
    if tanki_candidates:
        random.shuffle(tanki_candidates)
        hand.append(tanki_candidates[0])
    
    return hand[:13]

def validate_tile_usage(hand, available_tiles):
    """牌の重複チェック（1枚しかないのに2枚以上使用していないか）"""
    available_counts = count_tiles(available_tiles)
    hand_counts = count_tiles(hand)
    
    for tile, count in hand_counts.items():
        if count > available_counts.get(tile, 0):
            return False
    
    return True

def generate_cpu_tenpai(tiles, dora, force_chiitoitsu=False):
    """CPU聴牌形を生成"""
    try:
        # 七対子強制作成フラグがTrueの場合は七対子のみ作成
        if force_chiitoitsu:
            chiitoitsu_hand = build_chiitoitsu_hand(tiles)
            if validate_tile_usage(chiitoitsu_hand, tiles):
                return {
                    "success": True,
                    "hand": chiitoitsu_hand,
                    "type": "chiitoitsu_forced"
                }
            else:
                # 七対子も失敗した場合はランダム
                random_hand = random.sample(tiles, min(13, len(tiles)))
                return {
                    "success": True,
                    "hand": random_hand,
                    "type": "random_fallback"
                }
        
        # 1. 面子・対子・ターツを検出して聴牌形を構築
        tenpai_hand = build_tenpai_hand(tiles)
        
        # 2. 牌の重複チェック
        if validate_tile_usage(tenpai_hand, tiles):
            return {
                "success": True,
                "hand": tenpai_hand,
                "type": "normal"
            }
        else:
            # 3. 重複がある場合は七対子を作成
            chiitoitsu_hand = build_chiitoitsu_hand(tiles)
            if validate_tile_usage(chiitoitsu_hand, tiles):
                return {
                    "success": True,
                    "hand": chiitoitsu_hand,
                    "type": "chiitoitsu"
                }
            else:
                # 4. それでも失敗した場合はランダムな手牌
                random_hand = random.sample(tiles, min(13, len(tiles)))
                return {
                    "success": True,
                    "hand": random_hand,
                    "type": "random"
                }
    
    except Exception as e:
        # エラー時は七対子を作成
        try:
            chiitoitsu_hand = build_chiitoitsu_hand(tiles)
            return {
                "success": True,
                "hand": chiitoitsu_hand,
                "type": "chiitoitsu_fallback"
            }
        except:
            # 最終的にランダムな手牌
            random_hand = random.sample(tiles, min(13, len(tiles)))
            return {
                "success": True,
                "hand": random_hand,
                "type": "random_fallback"
            }

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input data provided"}), ensure_ascii=False)
        sys.exit(1)
    
    input_data = json.loads(sys.argv[1])
    
    tiles = input_data.get('tiles')
    dora = input_data.get('dora')
    force_chiitoitsu = input_data.get('forceChiitoitsu', False)
    
    if not tiles or not dora:
        print(json.dumps({"error": "Missing required parameters (tiles, dora)"}), ensure_ascii=False)
        sys.exit(1)
    
    result = generate_cpu_tenpai(tiles, dora, force_chiitoitsu)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
