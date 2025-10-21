import { NextResponse } from 'next/server';
import { TenpaiSuggestionRequest } from '@/types';
import { GoogleGenAI } from '@google/genai';

// Gemini APIの初期化
function getGeminiClient() {
  // APIキーは環境変数から自動取得される
  return new GoogleGenAI({});
}

// 牌を日本語表記に変換する関数
function convertTilesToJapanese(tiles: string[]): string[] {
  const tileMap: { [key: string]: string } = {
    '1m': '一萬', '2m': '二萬', '3m': '三萬', '4m': '四萬', '5m': '五萬',
    '6m': '六萬', '7m': '七萬', '8m': '八萬', '9m': '九萬',
    '1p': '一筒', '2p': '二筒', '3p': '三筒', '4p': '四筒', '5p': '五筒',
    '6p': '六筒', '7p': '七筒', '8p': '八筒', '9p': '九筒',
    '1s': '一索', '2s': '二索', '3s': '三索', '4s': '四索', '5s': '五索',
    '6s': '六索', '7s': '七索', '8s': '八索', '9s': '九索',
    '東': '東', '南': '南', '西': '西', '北': '北',
    '白': '白', '發': '發', '中': '中'
  };

  return tiles.map(tile => tileMap[tile] || tile);
}

// 牌の種類別枚数を計算する関数
function countTilesByType(tiles: string[]): { man: number, pin: number, sou: number, honor: number, honorDetails: { [key: string]: number } } {
  const counts = {
    man: 0,
    pin: 0,
    sou: 0,
    honor: 0,
    honorDetails: {} as { [key: string]: number }
  };

  tiles.forEach(tile => {
    if (tile.endsWith('m')) {
      counts.man++;
    } else if (tile.endsWith('p')) {
      counts.pin++;
    } else if (tile.endsWith('s')) {
      counts.sou++;
    } else {
      counts.honor++;
      counts.honorDetails[tile] = (counts.honorDetails[tile] || 0) + 1;
    }
  });

  return counts;
}

// 役を自動検出する関数
function detectPossibleYaku(tiles: string[], possibleMelds: { pairs: string[][], sequences: string[][], triplets: string[][], taatsu: string[][] }, tileCounts: { man: number; pin: number; sou: number; honor: number; honorDetails: Record<string, number> }): { yakuName: string, possibility: string, description: string, han?: number }[] {
  const yakuList: { yakuName: string, possibility: string, description: string, han?: number }[] = [];

  // 七対子: 対子6個以上
  if (possibleMelds.pairs.length >= 6) {
    yakuList.push({
      yakuName: "七対子",
      possibility: "高い",
      description: `対子が${possibleMelds.pairs.length}個あるため、七対子を狙えます。七対子は2翻の役で、7つの対子で手牌を完成させる特殊な形です。`,
      han: 2
    });
  }

  // 国士無双: 19字牌（1m,9m,1p,9p,1s,9s,東,南,西,北,白,發,中）のうち12種類以上
  const kokushiTiles = ['1m', '9m', '1p', '9p', '1s', '9s', '東', '南', '西', '北', '白', '發', '中'];
  const availableKokushiTiles = kokushiTiles.filter(tile => {
    if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
      // 数牌の場合
      // 数牌の処理
      return tiles.includes(tile);
    } else {
      // 字牌の場合
      return tiles.includes(tile);
    }
  });

  // 19字牌の種類数と、2枚以上ある牌の種類数をチェック
  const kokushiTypes = availableKokushiTiles.length;
  const hasDuplicate = availableKokushiTiles.some(tile => {
    const count = tiles.filter(t => t === tile).length;
    return count >= 2;
  });

  if (kokushiTypes >= 12 && hasDuplicate) {
    yakuList.push({
      yakuName: "国士無双",
      possibility: "高い",
      description: `19字牌のうち${kokushiTypes}種類が利用可能で、2枚以上ある牌もあるため、国士無双を狙えます。国士無双は13翻の役満で、19字牌を1つずつ揃える特殊な形です。`,
      han: 13
    });
  }

  // 四暗刻: 刻子4個以上
  if (possibleMelds.triplets.length >= 4) {
    yakuList.push({
      yakuName: "四暗刻",
      possibility: "高い",
      description: `刻子が${possibleMelds.triplets.length}個あるため、四暗刻を狙えます。四暗刻は13翻の役満で、4つの刻子を暗刻で作る役です。`,
      han: 13
    });
  }

  // 三暗刻: 刻子3個以上
  if (possibleMelds.triplets.length >= 3) {
    yakuList.push({
      yakuName: "三暗刻",
      possibility: "中程度",
      description: `刻子が${possibleMelds.triplets.length}個あるため、三暗刻を狙えます。三暗刻は2翻の役で、3つの刻子を暗刻で作る役です。`,
      han: 2
    });
  }

  // 清一色: 萬子/筒子/索子のいずれかが13枚以上
  if (tileCounts.man >= 13) {
    yakuList.push({
      yakuName: "清一色（萬子）",
      possibility: "高い",
      description: `萬子が${tileCounts.man}枚あるため、萬子の清一色を狙えます。清一色は6翻の高得点役で、同じ色の牌だけで手牌を作る役です。`,
      han: 6
    });
  }
  if (tileCounts.pin >= 13) {
    yakuList.push({
      yakuName: "清一色（筒子）",
      possibility: "高い",
      description: `筒子が${tileCounts.pin}枚あるため、筒子の清一色を狙えます。清一色は6翻の高得点役で、同じ色の牌だけで手牌を作る役です。`,
      han: 6
    });
  }
  if (tileCounts.sou >= 13) {
    yakuList.push({
      yakuName: "清一色（索子）",
      possibility: "高い",
      description: `索子が${tileCounts.sou}枚あるため、索子の清一色を狙えます。清一色は6翻の高得点役で、同じ色の牌だけで手牌を作る役です。`,
      han: 6
    });
  }

  // 順子・刻子・対子・塔子を事前に取得
  const sequences = possibleMelds.sequences;
  const pairs = possibleMelds.pairs;
  const triplets = possibleMelds.triplets;
  const taatsu = possibleMelds.taatsu;

  // 混一色: 萬子+字牌、筒子+字牌、索子+字牌で4面子1雀頭を作る
  // 混一色の条件チェック：4面子1雀頭を作るために必要な組み合わせを厳密にチェック
  const honitsuSuits = ['m', 'p', 's'];
  const honitsuSuitNames: { [key: string]: string } = { 'm': '萬子', 'p': '筒子', 's': '索子' };

  honitsuSuits.forEach(suit => {
    // 事前チェック: その色の数牌の枚数を取得
    const suitCount = suit === 'm' ? tileCounts.man : suit === 'p' ? tileCounts.pin : tileCounts.sou;

    // 2枚以上ある字牌の合計枚数を計算
    const honorPairsCount = (Object.values(tileCounts.honorDetails) as number[]).reduce((sum, count) => {
      return sum + (count >= 2 ? count : 0);
    }, 0);

    // 数牌 + 2枚以上ある字牌の合計が14枚未満なら検出しない
    if (suitCount + honorPairsCount < 14) {
      return;
    }

    // その色の数牌と字牌で構成される順子・刻子・対子を厳密にチェック
    const suitSequences = sequences.filter((seq: string[]) => {
      return seq.every(tile => tile.endsWith(suit) || !tile.match(/[0-9]/));
    });

    const suitPairs = pairs.filter((pair: string[]) => {
      return pair.every(tile => tile.endsWith(suit) || !tile.match(/[0-9]/));
    });

    const suitTriplets = triplets.filter((triplet: string[]) => {
      return triplet.every(tile => tile.endsWith(suit) || !tile.match(/[0-9]/));
    });

    // 厳密な4面子1雀頭の組み合わせチェック
    const totalMelds = suitSequences.length + suitTriplets.length;
    const totalPairs = suitPairs.length;

    // 4面子1雀頭を作るには、面子が4個以上、対子が1個以上必要
    if (totalMelds >= 4 && totalPairs >= 1) {
      yakuList.push({
        yakuName: `混一色（${honitsuSuitNames[suit]}）`,
        possibility: "高い",
        description: `${honitsuSuitNames[suit]}と字牌で面子${totalMelds}個（順子${suitSequences.length}個、刻子${suitTriplets.length}個）と対子${totalPairs}個があるため、混一色を狙えます。混一色は3翻の役です。`,
        han: 3
      });
    } else if (totalMelds >= 3 && totalPairs >= 1) {
      yakuList.push({
        yakuName: `混一色（${honitsuSuitNames[suit]}）`,
        possibility: "中程度",
        description: `${honitsuSuitNames[suit]}と字牌で面子${totalMelds}個（順子${suitSequences.length}個、刻子${suitTriplets.length}個）と対子${totalPairs}個があるため、混一色の可能性があります。混一色は3翻の役です。`,
        han: 3
      });
    }
  });

  // 字一色: 字牌のみ
  if (tileCounts.honor >= 13) {
    yakuList.push({
      yakuName: "字一色",
      possibility: "高い",
      description: `字牌が${tileCounts.honor}枚のみのため、字一色を狙えます。字一色は13翻の役満で、字牌のみで手牌を作る役です。`,
      han: 13
    });
  }

  // 大三元: 三元牌（白・發・中）をすべて刻子
  const sangenCount = (tileCounts.honorDetails['白'] || 0) + (tileCounts.honorDetails['發'] || 0) + (tileCounts.honorDetails['中'] || 0);
  if (sangenCount >= 9) {
    yakuList.push({
      yakuName: "大三元",
      possibility: "中程度",
      description: `三元牌が${sangenCount}枚あるため、大三元を狙えます。大三元は13翻の役満で、白・發・中をすべて刻子にする役です。`,
      han: 13
    });
  }

  // 小四喜: 風牌3種類を刻子、1種類を雀頭
  const windCount = (tileCounts.honorDetails['東'] || 0) + (tileCounts.honorDetails['南'] || 0) + (tileCounts.honorDetails['西'] || 0) + (tileCounts.honorDetails['北'] || 0);
  if (windCount >= 7) {
    yakuList.push({
      yakuName: "小四喜",
      possibility: "中程度",
      description: `風牌が${windCount}枚あるため、小四喜を狙えます。小四喜は13翻の役満で、風牌3種類を刻子、1種類を雀頭にする役です。`,
      han: 13
    });
  }

  // 大四喜: 風牌4種類すべてを刻子
  if (windCount >= 12) {
    yakuList.push({
      yakuName: "大四喜",
      possibility: "高い",
      description: `風牌が${windCount}枚あるため、大四喜を狙えます。大四喜は13翻の役満で、風牌4種類すべてを刻子にする役です。`,
      han: 13
    });
  }

  // 小三元: 三元牌2種類を刻子、1種類を雀頭
  if (sangenCount >= 7 && sangenCount < 9) {
    yakuList.push({
      yakuName: "小三元",
      possibility: "中程度",
      description: `三元牌が${sangenCount}枚あるため、小三元を狙えます。小三元は2翻の役で、三元牌2種類を刻子、1種類を雀頭にする役です。`,
      han: 2
    });
  }

  // 三元牌の役牌（白・發・中）: 各三元牌の刻子があれば表示
  const sangenTiles = ['白', '發', '中'];
  sangenTiles.forEach(sangenTile => {
    // 刻子に該当の三元牌があるかチェック
    const hasSangenTriplet = triplets.some((triplet: string[]) => {
      return triplet.length === 3 && triplet.every(tile => tile === sangenTile);
    });

    if (hasSangenTriplet) {
      yakuList.push({
        yakuName: sangenTile,
        possibility: "高い",
        description: `${sangenTile}の刻子が完成しています。役牌として1翻の役になります。`,
        han: 1
      });
    }
  });

  // 対々和: 刻子3つ+対子1つ
  if (possibleMelds.triplets.length >= 3 && possibleMelds.pairs.length >= 1) {
    yakuList.push({
      yakuName: "対々和",
      possibility: "中程度",
      description: `刻子${possibleMelds.triplets.length}個と対子${possibleMelds.pairs.length}個あるため、対々和を狙えます。対々和は2翻の役で、刻子3つ+対子1つで手牌を作る役です。`,
      han: 2
    });
  }


  // 一気通貫: 同色で1-9のうち8種類以上ある
  // 一気通貫の条件チェック：1-9の数字の種類数をカウント
  const ittsuSuits = ['m', 'p', 's'];
  const suitNames: { [key: string]: string } = { 'm': '萬子', 'p': '筒子', 's': '索子' };

  ittsuSuits.forEach(suit => {
    // その色の数牌のみを取得
    const suitTiles = tiles.filter(tile => tile.endsWith(suit));

    // 1-9の数字の種類数をカウント
    const availableNumbers = new Set<number>();
    suitTiles.forEach(tile => {
      const num = parseInt(tile[0]);
      if (num >= 1 && num <= 9) {
        availableNumbers.add(num);
      }
    });

    const availableCount = availableNumbers.size;
    const missingNumbers = [];
    for (let i = 1; i <= 9; i++) {
      if (!availableNumbers.has(i)) {
        missingNumbers.push(i);
      }
    }

    if (availableCount >= 8) {
      yakuList.push({
        yakuName: `一気通貫（${suitNames[suit]}）`,
        possibility: "高い",
        description: `${suitNames[suit]}で1-9のうち${availableCount}個の数字が揃っているため、一気通貫を狙えます。一気通貫は2翻の役で、同色で1-9の連続する順子を作る役です。`,
        han: 2
      });
    }
    // 8種類未満の場合は検出しない
  });

  // 緑一色: 2索、3索、4索、6索、8索、發のみで構成（役満）
  // 緑一色の条件チェック：34枚から直接検出
  const greenTiles = ['2s', '3s', '4s', '6s', '8s', '發'];
  const greenTileCount = tiles.filter(tile => greenTiles.includes(tile)).length;
  const nonGreenTiles = tiles.filter(tile => !greenTiles.includes(tile));

  if (greenTileCount >= 12) {
    yakuList.push({
      yakuName: "緑一色",
      possibility: "高い",
      description: `緑一色の牌が${greenTileCount}枚あるため、緑一色を狙えます。緑一色は役満で、2索、3索、4索、6索、8索、發のみで手牌を作る役です。`,
      han: 13
    });
  }
  // 緑一色の牌が12枚未満の場合は検出しない

  // 三色同順: 萬子・筒子・索子で同じ数字の順子
  // 三色同順の条件チェック：4面子1雀頭を作るために必要な組み合わせを厳密にチェック
  const sequenceNumbers: { [key: number]: string[] } = {};

  // 各順子の開始数字を色別に記録
  possibleMelds.sequences.forEach((seq: string[]) => {
    if (seq.length === 3) {
      const number = parseInt(seq[0][0]);
      const suit = seq[0].slice(-1);
      if (!sequenceNumbers[number]) {
        sequenceNumbers[number] = [];
      }
      sequenceNumbers[number].push(suit);
    }
  });

  // 同じ数字で3色揃っているか厳密にチェック
  Object.entries(sequenceNumbers).forEach(([number, suits]) => {
    const uniqueSuits = [...new Set(suits)];
    if (uniqueSuits.length >= 3) {
      // 3色揃っている場合のみ「高い」可能性
      yakuList.push({
        yakuName: "三色同順",
        possibility: "高い",
        description: `${number}の順子が萬子・筒子・索子の${uniqueSuits.length}色で揃っているため、三色同順を狙えます。三色同順は2翻の役で、萬子・筒子・索子で同じ数字の順子を作る役です。`,
        han: 2
      });
    }
    // 2色以下は検出しない（厳密化）
  });

  // 三色同刻: 萬子・筒子・索子で同じ数字の刻子
  // 三色同刻の条件チェック：4面子1雀頭を作るために必要な組み合わせを厳密にチェック
  const tripletNumbers: { [key: number]: string[] } = {};

  // 各刻子の数字を色別に記録
  possibleMelds.triplets.forEach((triplet: string[]) => {
    if (triplet.length === 3) {
      const number = parseInt(triplet[0][0]);
      const suit = triplet[0].slice(-1);
      if (!tripletNumbers[number]) {
        tripletNumbers[number] = [];
      }
      tripletNumbers[number].push(suit);
    }
  });

  // 同じ数字で3色揃っているか厳密にチェック
  Object.entries(tripletNumbers).forEach(([number, suits]) => {
    const uniqueSuits = [...new Set(suits)];
    if (uniqueSuits.length >= 3) {
      // 3色揃っている場合のみ「高い」可能性
      yakuList.push({
        yakuName: "三色同刻",
        possibility: "高い",
        description: `${number}の刻子が萬子・筒子・索子の${uniqueSuits.length}色で揃っているため、三色同刻を狙えます。三色同刻は2翻の役で、萬子・筒子・索子で同じ数字の刻子を作る役です。`,
        han: 2
      });
    }
    // 2色以下は検出しない（厳密化）
  });

  // 一盃口: 同じ順子が2つ（より詳細な検出）
  const sequenceCounts: { [key: string]: number } = {};

  // 利用可能な牌から順子の組み合わせを詳細にチェック
  const suits = ['m', 'p', 's'];
  suits.forEach(suit => {
    const suitTiles = tiles.filter(tile => tile.endsWith(suit));

    // 各数字の枚数をカウント
    const numberCounts: { [key: number]: number } = {};
    suitTiles.forEach(tile => {
      const num = parseInt(tile[0]);
      numberCounts[num] = (numberCounts[num] || 0) + 1;
    });

    // 連続する3枚の順子を探し、実際に作れる組数をカウント
    for (let i = 1; i <= 7; i++) {
      const count1 = numberCounts[i] || 0;
      const count2 = numberCounts[i + 1] || 0;
      const count3 = numberCounts[i + 2] || 0;

      // この順子を何組作れるか（最小値が組数）
      const possibleSets = Math.min(count1, count2, count3);

      if (possibleSets >= 1) {
        const sequenceKey = `${i}${suit},${i + 1}${suit},${i + 2}${suit}`;
        sequenceCounts[sequenceKey] = possibleSets;
      }
    }
  });

  // 同じ順子が2つ以上あるかチェック
  const duplicateSequences = Object.entries(sequenceCounts).filter(([, count]) => count >= 2);

  if (duplicateSequences.length >= 1) {
    yakuList.push({
      yakuName: "一盃口",
      possibility: "中程度",
      description: `同じ順子が${duplicateSequences.length}組（${duplicateSequences[0][0]}など）あるため、一盃口を狙えます。一盃口は1翻の役で、同じ順子を2つ作る役です。`,
      han: 1
    });
  }

  // 二盃口: 同じ順子の組み合わせが2種類以上、それぞれ2組ずつ
  if (duplicateSequences.length >= 2) {
    yakuList.push({
      yakuName: "二盃口",
      possibility: "中程度",
      description: `同じ順子が${duplicateSequences.length}種類、それぞれ2組ずつあるため、二盃口を狙えます。二盃口は3翻の役で、同じ順子の組み合わせを2種類×2組作る役です。`,
      han: 3
    });
  }

  // タンヤオ: 2-8の数牌のみで構成（1と9、字牌を含まない）
  // タンヤオの条件チェック：4面子1雀頭を作るために必要な組み合わせを探す

  if (sequences.length >= 3 && pairs.length >= 1) {
    // 2-8の数牌で構成される順子の数
    const tanyaoSequences = sequences.filter((seq: string[]) => {
      return seq.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number >= 2 && number <= 8;
        }
        return false;
      });
    });

    // 2-8の数牌で構成される対子の数
    const tanyaoPairs = pairs.filter((pair: string[]) => {
      return pair.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number >= 2 && number <= 8;
        }
        return false;
      });
    });

    // 2-8の数牌で構成される刻子の数
    const tanyaoTriplets = triplets.filter((triplet: string[]) => {
      return triplet.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number >= 2 && number <= 8;
        }
        return false;
      });
    });

    // 4面子1雀頭を作るために必要な組み合わせをチェック
    if (tanyaoSequences.length >= 3 && tanyaoPairs.length >= 1) {
      yakuList.push({
        yakuName: "タンヤオ",
        possibility: "高い",
        description: `2-8の数牌の順子${tanyaoSequences.length}個と対子${tanyaoPairs.length}個があるため、タンヤオを狙えます。タンヤオは1翻の役で、2-8の数牌のみで手牌を作る役です。`,
        han: 1
      });
    } else if (tanyaoSequences.length >= 2 && tanyaoPairs.length >= 1 && tanyaoTriplets.length >= 1) {
      yakuList.push({
        yakuName: "タンヤオ",
        possibility: "中程度",
        description: `2-8の数牌の順子${tanyaoSequences.length}個、刻子${tanyaoTriplets.length}個、対子${tanyaoPairs.length}個があるため、タンヤオの可能性があります。タンヤオは1翻の役です。`,
        han: 1
      });
    } else if (tanyaoSequences.length >= 1 && tanyaoPairs.length >= 1 && tanyaoTriplets.length >= 2) {
      yakuList.push({
        yakuName: "タンヤオ",
        possibility: "中程度",
        description: `2-8の数牌の順子${tanyaoSequences.length}個、刻子${tanyaoTriplets.length}個、対子${tanyaoPairs.length}個があるため、タンヤオの可能性があります。タンヤオは1翻の役です。`,
        han: 1
      });
    }
  }

  // 平和: 3面子 + 雀頭 + 両面待ち（刻子なし、雀頭は役牌以外）
  // 平和の条件チェック：4面子1雀頭を作るために必要な組み合わせを探す
  if (sequences.length >= 3 && pairs.length >= 1) {
    // 雀頭が役牌でないかチェック
    const honorTiles = ['東', '南', '西', '北', '白', '發', '中'];
    const nonHonorPairs = pairs.filter((pair: string[]) => {
      const tile = pair[0];
      return !honorTiles.includes(tile);
    });

    if (nonHonorPairs.length >= 1) {
      // 両面待ち（ターツ）があるかチェック
      const hasValidTaatsu = taatsu.some((taatsu: string[]) => {
        if (taatsu.length === 2) {
          const [tile1, tile2] = taatsu;
          // 同じ色で連続する数字（両面待ち）かチェック
          if (tile1.endsWith('m') && tile2.endsWith('m')) {
            const num1 = parseInt(tile1[0]);
            const num2 = parseInt(tile2[0]);
            return Math.abs(num1 - num2) === 1;
          } else if (tile1.endsWith('p') && tile2.endsWith('p')) {
            const num1 = parseInt(tile1[0]);
            const num2 = parseInt(tile2[0]);
            return Math.abs(num1 - num2) === 1;
          } else if (tile1.endsWith('s') && tile2.endsWith('s')) {
            const num1 = parseInt(tile1[0]);
            const num2 = parseInt(tile2[0]);
            return Math.abs(num1 - num2) === 1;
          }
        }
        return false;
      });

      if (hasValidTaatsu) {
        yakuList.push({
          yakuName: "平和",
          possibility: "中程度",
          description: `順子${sequences.length}個、対子${pairs.length}個があり、両面待ちの塔子もあるため、平和を狙えます。平和は1翻の役で、3つの順子+1つの対子で構成し、両面待ちで上がる役です。`,
          han: 1
        });
      }
    }
  }

  // 純全帯么九: すべての面子と雀頭に1・9の牌が含まれる
  // 純全帯么九の条件チェック：1・9を含む順子ベースで厳密にチェック
  // 1・9を含む順子の数
  const junchanSequences = sequences.filter((seq: string[]) => {
    return seq.some(tile => {
      if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
        const number = parseInt(tile[0]);
        return number === 1 || number === 9;
      }
      return false;
    });
  });

  // 1・9を含む順子が3個未満なら検出しない
  if (junchanSequences.length >= 3) {
    // 1・9の数牌で構成される対子の数
    const junchanPairs = pairs.filter((pair: string[]) => {
      return pair.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number === 1 || number === 9;
        }
        return false;
      });
    });

    // 1・9の数牌で構成される刻子の数
    const junchanTriplets = triplets.filter((triplet: string[]) => {
      return triplet.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number === 1 || number === 9;
        }
        return false;
      });
    });

    if (junchanSequences.length >= 4) {
      // 1・9を含む順子が4個以上ある場合のみ「高い」で検出
      yakuList.push({
        yakuName: "純全帯么九",
        possibility: "高い",
        description: `1・9を含む順子${junchanSequences.length}個があるため、純全帯么九を狙えます。純全帯么九は2翻の役で、すべての面子と雀頭に1・9の牌が含まれる役です。`,
        han: 3
      });
    } else if (junchanSequences.length >= 3) {
      // 1・9を含む順子が3個の場合、1・9の刻子または対子が十分にある場合のみ「中程度」で検出
      const totalMelds = junchanSequences.length + junchanTriplets.length;
      const totalPairs = junchanPairs.length;

      // 4面子1雀頭を作るには、合計で4面子以上、対子1個以上必要
      if (totalMelds >= 4 && totalPairs >= 1) {
        yakuList.push({
          yakuName: "純全帯么九",
          possibility: "中程度",
          description: `1・9を含む面子${totalMelds}個（順子${junchanSequences.length}個、刻子${junchanTriplets.length}個）と1・9の対子${totalPairs}個があるため、純全帯么九の可能性があります。純全帯么九は2翻の役です。`,
          han: 3
        });
      }
      // 条件を満たさない場合は検出しない
    }
  }
  // 1・9を含む順子が3個未満の場合は検出しない

  // 混全帯么九: すべての面子と雀頭に1・9の牌が含まれる（字牌も可）
  // 混全帯么九の条件チェック：1・9を含む順子ベースで厳密にチェック
  // 1・9を含む順子の数
  const honchanSequences = sequences.filter((seq: string[]) => {
    return seq.some(tile => {
      if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
        const number = parseInt(tile[0]);
        return number === 1 || number === 9;
      }
      return false;
    });
  });

  // 1・9を含む順子が3個未満なら検出しない
  if (honchanSequences.length >= 3) {
    // 1・9の数牌か字牌で構成される対子の数
    const honchanPairs = pairs.filter((pair: string[]) => {
      return pair.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number === 1 || number === 9;
        } else {
          // 字牌はOK
          return true;
        }
      });
    });

    // 1・9の数牌か字牌で構成される刻子の数
    const honchanTriplets = triplets.filter((triplet: string[]) => {
      return triplet.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number === 1 || number === 9;
        } else {
          // 字牌はOK
          return true;
        }
      });
    });

    if (honchanSequences.length >= 4) {
      // 1・9を含む順子が4個以上ある場合のみ「高い」で検出
      yakuList.push({
        yakuName: "混全帯么九",
        possibility: "高い",
        description: `1・9を含む順子${honchanSequences.length}個があるため、混全帯么九を狙えます。混全帯么九は2翻の役で、すべての面子と雀頭に1・9の牌が含まれる役です。`,
        han: 2
      });
    } else if (honchanSequences.length >= 3) {
      // 1・9を含む順子が3個の場合、1・9の刻子または対子が十分にある場合のみ「中程度」で検出
      const totalMelds = honchanSequences.length + honchanTriplets.length;
      const totalPairs = honchanPairs.length;

      // 4面子1雀頭を作るには、合計で4面子以上、対子1個以上必要
      if (totalMelds >= 4 && totalPairs >= 1) {
        yakuList.push({
          yakuName: "混全帯么九",
          possibility: "中程度",
          description: `1・9を含む面子${totalMelds}個（順子${honchanSequences.length}個、刻子${honchanTriplets.length}個）と1・9の数牌か字牌の対子${totalPairs}個があるため、混全帯么九の可能性があります。混全帯么九は2翻の役です。`,
          han: 2
        });
      }
      // 条件を満たさない場合は検出しない
    }
  }
  // 1・9を含む順子が3個未満の場合は検出しない

  // 混老頭: すべての面子と雀頭に1・9の牌か字牌が含まれる
  // 混老頭の条件チェック：刻子ベースで厳密にチェック
  if (triplets.length >= 3) {
    // 1・9・字牌の刻子をチェック
    const honroutouTriplets = triplets.filter((triplet: string[]) => {
      return triplet.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number === 1 || number === 9;
        } else {
          // 字牌はOK
          return true;
        }
      });
    });

    if (honroutouTriplets.length >= 3) {
      // 1・9・字牌の刻子が3個以上ある
      if (honroutouTriplets.length >= 4) {
        // 刻子が4個以上なら高確率
        yakuList.push({
          yakuName: "混老頭",
          possibility: "高い",
          description: `1・9・字牌の刻子が${honroutouTriplets.length}個あるため、混老頭を狙えます。混老頭は2翻の役で、すべての面子と雀頭に1・9の牌か字牌が含まれる役です。`,
          han: 2
        });
      } else {
        // 刻子が3個の場合、刻子で使ったもの以外で1・9・字牌の対子を探す
        const usedTiles = new Set<string>();
        honroutouTriplets.forEach((triplet: string[]) => {
          triplet.forEach((tile: string) => usedTiles.add(tile));
        });

        // 刻子で使っていない1・9・字牌の対子をチェック
        const availablePairs = pairs.filter((pair: string[]) => {
          const isHonroutou = pair.every(tile => {
            if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
              const number = parseInt(tile[0]);
              return number === 1 || number === 9;
            } else {
              return true; // 字牌はOK
            }
          });

          // 刻子で使っていない牌の対子かチェック
          const notUsed = pair.every(tile => !usedTiles.has(tile));
          return isHonroutou && notUsed;
        });

        if (availablePairs.length >= 2) {
          yakuList.push({
            yakuName: "混老頭",
            possibility: "高い",
            description: `1・9・字牌の刻子${honroutouTriplets.length}個と、刻子で使っていない1・9・字牌の対子${availablePairs.length}個があるため、混老頭を狙えます。混老頭は2翻の役です。`,
            han: 2
          });
        }
        // 対子が2個未満の場合は検出しない（可能性なし）
      }
    }
    // 1・9・字牌の刻子が3個未満の場合は検出しない（可能性なし）
  }
  // 刻子が3個未満の場合は検出しない（可能性なし）

  // 清老頭: すべての面子と雀頭に1・9の牌が含まれ、字牌を含まない（役満）
  // 清老頭の条件チェック：刻子ベースで厳密にチェック
  if (triplets.length >= 3) {
    // 1・9の数牌の刻子をチェック（字牌は不可）
    const chinroutouTriplets = triplets.filter((triplet: string[]) => {
      return triplet.every(tile => {
        if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
          const number = parseInt(tile[0]);
          return number === 1 || number === 9;
        } else {
          // 字牌は不可
          return false;
        }
      });
    });

    if (chinroutouTriplets.length >= 3) {
      // 1・9の刻子が3個以上ある
      if (chinroutouTriplets.length >= 4) {
        // 刻子が4個以上なら高確率
        yakuList.push({
          yakuName: "清老頭",
          possibility: "高い",
          description: `1・9の刻子が${chinroutouTriplets.length}個あるため、清老頭を狙えます。清老頭は役満で、すべての面子と雀頭に1・9の牌が含まれ、字牌を含まない役です。`,
          han: 13
        });
      } else {
        // 刻子が3個の場合、刻子で使ったもの以外で1・9の対子を探す
        const usedTiles = new Set<string>();
        chinroutouTriplets.forEach((triplet: string[]) => {
          triplet.forEach((tile: string) => usedTiles.add(tile));
        });

        // 刻子で使っていない1・9の対子をチェック
        const availablePairs = pairs.filter((pair: string[]) => {
          const isChinroutou = pair.every(tile => {
            if (tile.endsWith('m') || tile.endsWith('p') || tile.endsWith('s')) {
              const number = parseInt(tile[0]);
              return number === 1 || number === 9;
            } else {
              return false; // 字牌は不可
            }
          });

          // 刻子で使っていない牌の対子かチェック
          const notUsed = pair.every(tile => !usedTiles.has(tile));
          return isChinroutou && notUsed;
        });

        if (availablePairs.length >= 2) {
          yakuList.push({
            yakuName: "清老頭",
            possibility: "高い",
            description: `1・9の刻子${chinroutouTriplets.length}個と、刻子で使っていない1・9の対子${availablePairs.length}個があるため、清老頭を狙えます。清老頭は役満です。`,
            han: 13
          });
        }
        // 対子が2個未満の場合は検出しない（可能性なし）
      }
    }
    // 1・9の刻子が3個未満の場合は検出しない（可能性なし）
  }
  // 刻子が3個未満の場合は検出しない（可能性なし）


  // 九蓮宝燈: 同色で1112345678999の形（役満）
  // 九蓮宝燈の条件チェック：34枚から直接検出
  const chuurenSuits = ['m', 'p', 's'];
  const chuurenSuitNames: { [key: string]: string } = { 'm': '萬子', 'p': '筒子', 's': '索子' };

  chuurenSuits.forEach(suit => {
    const suitTiles = tiles.filter(tile => tile.endsWith(suit));
    const numbers = suitTiles.map(tile => parseInt(tile[0])).sort();

    // 九蓮宝燈の形をチェック：1112345678999
    const has111 = numbers.filter(n => n === 1).length >= 3;
    const has23456789 = [2, 3, 4, 5, 6, 7, 8, 9].every(n => numbers.includes(n));
    const has999 = numbers.filter(n => n === 9).length >= 3;

    if (has111 && has23456789 && has999) {
      yakuList.push({
        yakuName: `九蓮宝燈（${chuurenSuitNames[suit]}）`,
        possibility: "高い",
        description: `${chuurenSuitNames[suit]}で1112345678999の形が揃っているため、九蓮宝燈を狙えます。九蓮宝燈は役満で、同色で1112345678999の形で手牌を作る役です。`,
        han: 13
      });
    } else {
      const missingTiles = [];
      if (!has111) missingTiles.push('1が3枚以上');
      if (!has23456789) {
        const missingNumbers = [2, 3, 4, 5, 6, 7, 8, 9].filter(n => !numbers.includes(n));
        if (missingNumbers.length > 0) missingTiles.push(`${missingNumbers.join(',')}が不足`);
      }
      if (!has999) missingTiles.push('9が3枚以上');

      const completedCount = 3 - missingTiles.length;
      if (completedCount >= 2) {
        yakuList.push({
          yakuName: `九蓮宝燈（${chuurenSuitNames[suit]}）`,
          possibility: "中程度",
          description: `${chuurenSuitNames[suit]}で九蓮宝燈の形が${completedCount}部分揃っており、残り${missingTiles.join('、')}で九蓮宝燈を狙えます。九蓮宝燈は役満です。`,
          han: 13
        });
      } else if (completedCount >= 1) {
        yakuList.push({
          yakuName: `九蓮宝燈（${chuurenSuitNames[suit]}）`,
          possibility: "低い",
          description: `${chuurenSuitNames[suit]}で九蓮宝燈の形が${completedCount}部分揃っており、残り${missingTiles.join('、')}で九蓮宝燈を狙えます。九蓮宝燈は役満です。`,
          han: 13
        });
      }
    }
  });

  // 純正九蓮宝燈: 同色で1112345678999の形で、1か9のどちらかが4枚（役満）
  // 純正九蓮宝燈の条件チェック：34枚から直接検出
  chuurenSuits.forEach(suit => {
    const suitTiles = tiles.filter(tile => tile.endsWith(suit));
    const numbers = suitTiles.map(tile => parseInt(tile[0])).sort();

    // 九蓮宝燈の基本形をチェック
    const has111 = numbers.filter(n => n === 1).length >= 3;
    const has23456789 = [2, 3, 4, 5, 6, 7, 8, 9].every(n => numbers.includes(n));
    const has999 = numbers.filter(n => n === 9).length >= 3;

    if (has111 && has23456789 && has999) {
      // 1か9のどちらかが4枚以上あるかチェック
      const onesCount = numbers.filter(n => n === 1).length;
      const ninesCount = numbers.filter(n => n === 9).length;

      if (onesCount >= 4 || ninesCount >= 4) {
        yakuList.push({
          yakuName: `純正九蓮宝燈（${chuurenSuitNames[suit]}）`,
          possibility: "高い",
          description: `${chuurenSuitNames[suit]}で1112345678999の形が揃い、${onesCount >= 4 ? '1が4枚以上' : '9が4枚以上'}あるため、純正九蓮宝燈を狙えます。純正九蓮宝燈は役満で、九蓮宝燈の形で1か9が4枚以上ある役です。`,
          han: 13
        });
      }
    }
  });

  // 「低い」可能性の役は除外
  return yakuList.filter(yaku => yaku.possibility !== "低い");
}

// 順子・刻子・塔子を事前計算する関数
function findPossibleMelds(tiles: string[]): { sequences: string[][], triplets: string[][], pairs: string[][], taatsu: string[][] } {
  const sequences: string[][] = [];
  const triplets: string[][] = [];
  const pairs: string[][] = [];
  const taatsu: string[][] = [];

  // 各牌種ごとに処理
  const suits = ['m', 'p', 's'];

  suits.forEach(suit => {
    const suitTiles = tiles.filter(tile => tile.endsWith(suit)).sort();
    const numbers = suitTiles.map(tile => parseInt(tile[0]));

    // 刻子（同じ数字3枚）を探す
    for (let i = 1; i <= 9; i++) {
      const count = numbers.filter(n => n === i).length;
      if (count >= 3) {
        triplets.push([`${i}${suit}`, `${i}${suit}`, `${i}${suit}`]);
      }
      if (count >= 2) {
        pairs.push([`${i}${suit}`, `${i}${suit}`]);
      }
    }

    // 順子（連続する3枚）を探す
    const usedInSequences = new Set<number>();
    for (let i = 1; i <= 7; i++) {
      if (numbers.includes(i) && numbers.includes(i + 1) && numbers.includes(i + 2)) {
        sequences.push([`${i}${suit}`, `${i + 1}${suit}`, `${i + 2}${suit}`]);
        usedInSequences.add(i);
        usedInSequences.add(i + 1);
        usedInSequences.add(i + 2);
      }
    }

    // 塔子（ターツ）を探す（順子で使わなかった牌のみ）
    // 連続する2枚（例：3s4s）- 両面待ち
    for (let i = 1; i <= 8; i++) {
      if (numbers.includes(i) && numbers.includes(i + 1) &&
        !usedInSequences.has(i) && !usedInSequences.has(i + 1)) {
        taatsu.push([`${i}${suit}`, `${i + 1}${suit}`]);
      }
    }

    // 1枚抜けの2枚（例：3s5s）- カンチャン待ち
    for (let i = 1; i <= 7; i++) {
      if (numbers.includes(i) && numbers.includes(i + 2) &&
        !usedInSequences.has(i) && !usedInSequences.has(i + 2)) {
        taatsu.push([`${i}${suit}`, `${i + 2}${suit}`]);
      }
    }
  });

  // 字牌の刻子・対子を探す
  const honorTiles = tiles.filter(tile => !tile.endsWith('m') && !tile.endsWith('p') && !tile.endsWith('s'));
  const honorCounts: { [key: string]: number } = {};

  honorTiles.forEach(tile => {
    honorCounts[tile] = (honorCounts[tile] || 0) + 1;
  });

  Object.entries(honorCounts).forEach(([tile, count]) => {
    if (count >= 3) {
      triplets.push([tile, tile, tile]);
    }
    if (count >= 2) {
      pairs.push([tile, tile]);
    }
  });

  return { sequences, triplets, pairs, taatsu };
}

// Gemini APIに送信するプロンプトを生成
function generatePrompt(tiles: string[], handTiles: string[], detectedYaku: { yakuName: string, possibility: string, description: string, han?: number }[]): string {
  const selectedCount = handTiles.length;
  const japaneseTiles = convertTilesToJapanese(tiles);
  const japaneseHandTiles = convertTilesToJapanese(handTiles);

  // 牌の種類別枚数を事前計算
  const tileCounts = countTilesByType(tiles);
  const handTileCounts = countTilesByType(handTiles);

  // 順子・刻子を事前計算
  const possibleMelds = findPossibleMelds(tiles);

  const prompt = `あなたは麻雀を熟知し、思考力が長けているプロ雀士です。普通の麻雀とは全く違うルールだが以下のルールをよく理解し、最適な手牌選択や戦略を提案してください。

【ゲームルール】
この二人麻雀ゲームは以下のオリジナルルールです：

1. **基本ルール**:
   - プレイヤーは2人
   - 各プレイヤーにランダムに34枚を配布
   - プレイヤーは34枚から13枚を選択して手牌を作成
   - 残りの21枚が捨て牌候補となる

2. **特徴的なルール**:
   - 対局中は手牌13枚が固定、捨て牌は残りの21枚から選択
   - **鳴き（ポン・チー）は考慮しなくて良い**

3. **基本形について**:
   - **基本形**: 4面子1雀頭の形（順子・刻子の組み合わせ）
   - **順子**: 連続する3枚の数牌（例：1m2m3m）
   - **刻子**: 同じ牌3枚（例：東東東）
   - **雀頭**: 同じ牌2枚（例：白白）

4. **説明の注意事項**:
   - このゲームは高齢の初心者向けです
   - **専門用語をなるべく使わないでください**
   - 例: 「面子」→「3枚セット」、「雀頭」→「2枚ペア」、「順子」→「連続する3枚」、「刻子」→「同じ牌3枚」

5. **牌の表記**:
   - 萬子: 一萬〜九萬 (1m〜9m)
   - 筒子: 一筒〜九筒 (1p〜9p)
   - 索子: 一索〜九索 (1s〜9s)
   - 字牌: 東・南・西・北・白・發・中

【利用可能な牌】
利用可能な牌 (${tiles.length}枚): ${japaneseTiles.join(', ')}

【牌種別枚数（正確な数値）】
- 萬子: ${tileCounts.man}枚
- 筒子: ${tileCounts.pin}枚  
- 索子: ${tileCounts.sou}枚
- 字牌: ${tileCounts.honor}枚
  ${Object.entries(tileCounts.honorDetails).map(([tile, count]) => `  - ${tile}: ${count}枚`).join('\n')}

【現在の手牌】
選択済み牌 (${selectedCount}枚): ${japaneseHandTiles.join(', ')}

【選択済み牌の枚数】
- 萬子: ${handTileCounts.man}枚
- 筒子: ${handTileCounts.pin}枚
- 索子: ${handTileCounts.sou}枚
- 字牌: ${handTileCounts.honor}枚

【作れる面子（事前計算済み）】
- 順子: ${possibleMelds.sequences.length}個
  ${possibleMelds.sequences.map(seq => `  - ${seq.join(' ')}`).join('\n')}
- 刻子: ${possibleMelds.triplets.length}個
  ${possibleMelds.triplets.map(trip => `  - ${trip.join(' ')}`).join('\n')}
- 対子: ${possibleMelds.pairs.length}個
  ${possibleMelds.pairs.map(pair => `  - ${pair.join(' ')}`).join('\n')}
- 塔子（ターツ）: ${possibleMelds.taatsu.length}個
  ${possibleMelds.taatsu.map(taatsu => `  - ${taatsu.join(' ')}`).join('\n')}

【思考プロセス】
以下の手順で分析を行ってください：

1. **牌種分析**:
   - 上記の「牌種別枚数（正確な数値）」を参考に分析してください
   - 事前計算された数値をそのまま使用してください（再計算は不要）

2. **役の可能性チェック**:
   - **優先役**: ピンフ・タンヤオは基本的で簡単なため優先的に考える
   - どれか一種類の数牌が13枚以上あれば清一色を考える
   - 字牌の各種類で3枚以上あるものがあれば、それを使ったホンイツを考える

3. **面子の組み合わせ**:
   - 上記の「作れる面子（事前計算済み）」を参考に分析してください
   - 事前計算された順子・刻子・対子・塔子を活用してください

【目標】
**検出された役のdescription部分を補完してください。**

【検出された役のdescription補完】
以下の役が検出されました。各役について、初心者にも分かりやすい説明を補完してください：

${detectedYaku.map(yaku => `- ${yaku.yakuName}: ${yaku.description}`).join('\n')}

【補完の指示】
各役について以下の形式で簡潔に説明してください：
1. 一言説明（70文字以内、役の特徴を端的に）
2. 実際に揃っている代表的な牌（最大6枚まで、牌コード形式）
   - 例: ["1m", "2m", "3m", "4p", "5p", "6p"]
   - 順子なら連続する3枚、刻子なら同じ牌3枚、対子なら同じ牌2枚

【出力形式】
以下のJSON形式で出力してください：

\`\`\`json
{
  "yakuAnalysis": [
    {
      "yakuName": "検出された役名",
      "summary": "一言説明（70文字以内）",
      "exampleTiles": ["1m", "2m", "3m", "4p", "5p", "6p"]
    }
  ]
}
\`\`\`

【注意事項】
- summaryは70文字以内で簡潔に
- exampleTilesは実際に揃っている代表的な牌を最大6枚まで
- 役の矛盾した推奨は絶対に避けてください`;

  // 特別指示は削除

  return prompt;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as TenpaiSuggestionRequest;

    // バリデーション
    if (!body.tiles || !Array.isArray(body.tiles) || body.tiles.length < 1) {
      return NextResponse.json(
        { error: '利用可能な牌が指定されていません' },
        { status: 400 }
      );
    }

    if (!body.handTiles || !Array.isArray(body.handTiles) || body.handTiles.length > 13) {
      return NextResponse.json(
        { error: '手牌は13枚以下である必要があります' },
        { status: 400 }
      );
    }

    // 利用可能な牌と手牌の合計が13枚以上であることを確認
    if (body.tiles.length + body.handTiles.length < 13) {
      return NextResponse.json(
        { error: '利用可能な牌と手牌の合計が13枚未満です' },
        { status: 400 }
      );
    }

    try {
      // Gemini APIクライアントを取得
      const ai = getGeminiClient();



      // 順子・刻子を事前計算
      const possibleMelds = findPossibleMelds(body.tiles);
      const tileCounts = countTilesByType(body.tiles);

      // 役を自動検出
      const detectedYaku = detectPossibleYaku(body.tiles, possibleMelds, tileCounts);

      // プロンプトを生成（検出された役のリストを含む）
      const prompt = generatePrompt(body.tiles, body.handTiles, detectedYaku);

      // Gemini APIに送信
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 4096,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const text = response.text || '';

      // JSONレスポンスを解析
      let parsedResponse;
      try {

        // JSON部分を抽出（```json と ``` で囲まれている可能性がある）
        let jsonString = text;

        // ```json``` パターンを優先検索
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1].trim();
        } else {
          // ``` のみのパターンを検索
          const codeMatch = text.match(/```\s*([\s\S]*?)\s*```/);
          if (codeMatch) {
            jsonString = codeMatch[1].trim();
          }
        }

        // JSON文字列が空でない場合のみ解析を試行
        if (jsonString.trim()) {
          parsedResponse = JSON.parse(jsonString);
        } else {
          throw new Error('Empty JSON string');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse JSON. Using fallback response.');

        // JSON解析に失敗した場合は空の提案を返す
        parsedResponse = {
          yakuAnalysis: []
        };
      }

      // 検出された役のdescriptionをGeminiの回答で補完
      const enhancedYaku = detectedYaku.map(yaku => {
        const geminiResponse = parsedResponse.yakuAnalysis?.find((geminiYaku: { yakuName: string }) =>
          geminiYaku.yakuName === yaku.yakuName
        );
        const summary = geminiResponse?.summary || yaku.description;
        return {
          ...yaku,
          summary: summary.length > 70 ? summary.substring(0, 70) + '...' : summary,
          exampleTiles: geminiResponse?.exampleTiles || [],
          description: geminiResponse?.description || yaku.description,
          han: yaku.han || 1  // hanがない場合は1をデフォルト値とする
        };
      });

      // レスポンスを新しい形式に変換
      const suggestions = {
        patterns: [{
          // 基本情報
          tiles: body.handTiles,
          waitingTiles: [],
          source: "gemini",
          melds: possibleMelds,
          tileCounts: tileCounts,

          // 役の分析（Geminiで補完されたdescription）
          yakuAnalysis: enhancedYaku
        }]
      };

      return NextResponse.json(suggestions);
    } catch (geminiError) {
      console.error('=== Gemini API Error Debug ===');
      console.error('Error type:', typeof geminiError);
      console.error('Error message:', geminiError instanceof Error ? geminiError.message : String(geminiError));
      console.error('Error stack:', geminiError instanceof Error ? geminiError.stack : 'No stack trace');
      console.error('Full error:', geminiError);

      // フォールバック: シンプルな提案
      const suggestions = {
        patterns: [
          {
            tiles: body.handTiles,
            waitingTiles: [
              {
                tile: "1m",
                yaku: ["タンヤオ"]
              }
            ],
            source: "fallback"
          }
        ]
      };

      return NextResponse.json(suggestions);
    }
  } catch (error) {
    console.error('Suggest tenpai error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
