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
    """聴牌形を構築（面子3組 + 対子1組 + ターツ1組）- 貪欲法"""
    try:
        tile_counts = Counter(tiles)
        hand = []
        melds_count = 0
        
        # 1. 刻子を優先的に作る（最大3組）
        tiles_list = list(tile_counts.keys())
        random.shuffle(tiles_list)  # ランダム性を持たせる
        
        for tile in tiles_list:
            if melds_count >= 3:
                break
            if tile_counts[tile] >= 3:
                hand.extend([tile, tile, tile])
                tile_counts[tile] -= 3
                melds_count += 1
        
        # 2. 順子を作る（3組まで）
        suits = ['m', 'p', 's']
        random.shuffle(suits)  # ランダム性を持たせる
        
        for suit in suits:
            if melds_count >= 3:
                break
            numbers = list(range(1, 8))
            random.shuffle(numbers)  # ランダム性を持たせる
            
            for i in numbers:
                if melds_count >= 3:
                    break
                if (tile_counts.get(f"{i}{suit}", 0) >= 1 and
                    tile_counts.get(f"{i+1}{suit}", 0) >= 1 and
                    tile_counts.get(f"{i+2}{suit}", 0) >= 1):
                    hand.extend([f"{i}{suit}", f"{i+1}{suit}", f"{i+2}{suit}"])
                    tile_counts[f"{i}{suit}"] -= 1
                    tile_counts[f"{i+1}{suit}"] -= 1
                    tile_counts[f"{i+2}{suit}"] -= 1
                    melds_count += 1
        
        # 3組の面子が作れなかった場合は失敗
        if melds_count < 3:
            return random.sample(tiles, min(13, len(tiles)))
        
        # 3. 対子を作る（1組）
        pair_added = False
        remaining_tiles = list(tile_counts.keys())
        random.shuffle(remaining_tiles)
        
        for tile in remaining_tiles:
            if tile_counts[tile] >= 2:
                hand.extend([tile, tile])
                tile_counts[tile] -= 2
                pair_added = True
                break
        
        if not pair_added:
            return random.sample(tiles, min(13, len(tiles)))
        
        # 4. ターツを作る（1組）
        taatsu_added = False
        suits_for_taatsu = ['m', 'p', 's']
        random.shuffle(suits_for_taatsu)
        
        for suit in suits_for_taatsu:
            if taatsu_added:
                break
            numbers_for_taatsu = list(range(1, 9))
            random.shuffle(numbers_for_taatsu)
            
            for i in numbers_for_taatsu:
                if (tile_counts.get(f"{i}{suit}", 0) >= 1 and
                    tile_counts.get(f"{i+1}{suit}", 0) >= 1):
                    hand.extend([f"{i}{suit}", f"{i+1}{suit}"])
                    tile_counts[f"{i}{suit}"] -= 1
                    tile_counts[f"{i+1}{suit}"] -= 1
                    taatsu_added = True
                    break
        
        if not taatsu_added:
            return random.sample(tiles, min(13, len(tiles)))
        
        # 5. 13枚確認
        if len(hand) != 13:
            return random.sample(tiles, min(13, len(tiles)))
        
        return hand
        
    except Exception as e:
        # エラー時はランダム13枚
        return random.sample(tiles, min(13, len(tiles)))

def build_chiitoitsu_hand(tiles):
    """七対子を構築（対子6組 + 単騎1枚）- 貪欲法"""
    try:
        tile_counts = Counter(tiles)
        hand = []
        pairs_count = 0
        
        # 1. 対子を貪欲に作る（6組）
        tiles_list = list(tile_counts.keys())
        random.shuffle(tiles_list)  # ランダム性を持たせる
        
        for tile in tiles_list:
            if pairs_count >= 6:
                break
            if tile_counts[tile] >= 2:
                hand.extend([tile, tile])
                tile_counts[tile] -= 2
                pairs_count += 1
        
        # 対子が6組作れなかった場合は失敗
        if pairs_count < 6:
            return random.sample(tiles, min(13, len(tiles)))
        
        # 2. 単騎を作る（1枚）
        # 残っている牌から1枚選択
        tanki_candidates = []
        for tile, count in tile_counts.items():
            if count >= 1:
                # 各牌を枚数分だけ候補に追加
                tanki_candidates.extend([tile] * count)
        
        if not tanki_candidates:
            return random.sample(tiles, min(13, len(tiles)))
        
        # ランダムに1枚選択
        random.shuffle(tanki_candidates)
        hand.append(tanki_candidates[0])
        
        # 3. 13枚確認
        if len(hand) != 13:
            return random.sample(tiles, min(13, len(tiles)))
        
        return hand
        
    except Exception as e:
        # エラー時はランダム13枚
        return random.sample(tiles, min(13, len(tiles)))

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
