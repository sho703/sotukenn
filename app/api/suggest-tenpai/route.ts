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
function detectPossibleYaku(tiles: string[], possibleMelds: any, tileCounts: any): { yakuName: string, possibility: string, description: string }[] {
  const yakuList: { yakuName: string, possibility: string, description: string }[] = [];

  // 七対子: 対子6個以上
  if (possibleMelds.pairs.length >= 6) {
    yakuList.push({
      yakuName: "七対子",
      possibility: "高い",
      description: `対子が${possibleMelds.pairs.length}個あるため、七対子を狙えます。七対子は2翻の役で、7つの対子で手牌を完成させる特殊な形です。`
    });
  }

  // 国士無双: 19字牌で12種類以上
  const honorTypes = Object.keys(tileCounts.honorDetails);
  if (tileCounts.honor >= 12 && honorTypes.length >= 12) {
    yakuList.push({
      yakuName: "国士無双",
      possibility: "高い",
      description: `字牌が${tileCounts.honor}枚で${honorTypes.length}種類あるため、国士無双を狙えます。国士無双は13翻の役満で、19字牌を1つずつ揃える特殊な形です。`
    });
  }

  // 四暗刻: 刻子4個以上
  if (possibleMelds.triplets.length >= 4) {
    yakuList.push({
      yakuName: "四暗刻",
      possibility: "高い",
      description: `刻子が${possibleMelds.triplets.length}個あるため、四暗刻を狙えます。四暗刻は13翻の役満で、4つの刻子を暗刻で作る役です。`
    });
  }

  // 三暗刻: 刻子3個以上
  if (possibleMelds.triplets.length >= 3) {
    yakuList.push({
      yakuName: "三暗刻",
      possibility: "中程度",
      description: `刻子が${possibleMelds.triplets.length}個あるため、三暗刻を狙えます。三暗刻は2翻の役で、3つの刻子を暗刻で作る役です。`
    });
  }

  // 清一色: 萬子/筒子/索子のいずれかが13枚以上
  if (tileCounts.man >= 13) {
    yakuList.push({
      yakuName: "清一色（萬子）",
      possibility: "高い",
      description: `萬子が${tileCounts.man}枚あるため、萬子の清一色を狙えます。清一色は6翻の高得点役で、同じ色の牌だけで手牌を作る役です。`
    });
  }
  if (tileCounts.pin >= 13) {
    yakuList.push({
      yakuName: "清一色（筒子）",
      possibility: "高い",
      description: `筒子が${tileCounts.pin}枚あるため、筒子の清一色を狙えます。清一色は6翻の高得点役で、同じ色の牌だけで手牌を作る役です。`
    });
  }
  if (tileCounts.sou >= 13) {
    yakuList.push({
      yakuName: "清一色（索子）",
      possibility: "高い",
      description: `索子が${tileCounts.sou}枚あるため、索子の清一色を狙えます。清一色は6翻の高得点役で、同じ色の牌だけで手牌を作る役です。`
    });
  }

  // 混一色: 萬子+字牌、筒子+字牌、索子+字牌で13枚以上
  if (tileCounts.man + tileCounts.honor >= 13) {
    yakuList.push({
      yakuName: "混一色（萬子+字牌）",
      possibility: "中程度",
      description: `萬子${tileCounts.man}枚と字牌${tileCounts.honor}枚で合計${tileCounts.man + tileCounts.honor}枚あるため、混一色を狙えます。混一色は3翻の役で、一種類の数牌と字牌で手牌を作る役です。`
    });
  }
  if (tileCounts.pin + tileCounts.honor >= 13) {
    yakuList.push({
      yakuName: "混一色（筒子+字牌）",
      possibility: "中程度",
      description: `筒子${tileCounts.pin}枚と字牌${tileCounts.honor}枚で合計${tileCounts.pin + tileCounts.honor}枚あるため、混一色を狙えます。混一色は3翻の役で、一種類の数牌と字牌で手牌を作る役です。`
    });
  }
  if (tileCounts.sou + tileCounts.honor >= 13) {
    yakuList.push({
      yakuName: "混一色（索子+字牌）",
      possibility: "中程度",
      description: `索子${tileCounts.sou}枚と字牌${tileCounts.honor}枚で合計${tileCounts.sou + tileCounts.honor}枚あるため、混一色を狙えます。混一色は3翻の役で、一種類の数牌と字牌で手牌を作る役です。`
    });
  }

  // 字一色: 字牌のみ
  if (tileCounts.man === 0 && tileCounts.pin === 0 && tileCounts.sou === 0 && tileCounts.honor >= 13) {
    yakuList.push({
      yakuName: "字一色",
      possibility: "高い",
      description: `字牌が${tileCounts.honor}枚のみのため、字一色を狙えます。字一色は13翻の役満で、字牌のみで手牌を作る役です。`
    });
  }

  // 大三元: 三元牌（白・發・中）をすべて刻子
  const sangenCount = (tileCounts.honorDetails['白'] || 0) + (tileCounts.honorDetails['發'] || 0) + (tileCounts.honorDetails['中'] || 0);
  if (sangenCount >= 9) {
    yakuList.push({
      yakuName: "大三元",
      possibility: "中程度",
      description: `三元牌が${sangenCount}枚あるため、大三元を狙えます。大三元は13翻の役満で、白・發・中をすべて刻子にする役です。`
    });
  }

  // 小四喜: 風牌3種類を刻子、1種類を雀頭
  const windCount = (tileCounts.honorDetails['東'] || 0) + (tileCounts.honorDetails['南'] || 0) + (tileCounts.honorDetails['西'] || 0) + (tileCounts.honorDetails['北'] || 0);
  if (windCount >= 7) {
    yakuList.push({
      yakuName: "小四喜",
      possibility: "中程度",
      description: `風牌が${windCount}枚あるため、小四喜を狙えます。小四喜は13翻の役満で、風牌3種類を刻子、1種類を雀頭にする役です。`
    });
  }

  // 大四喜: 風牌4種類すべてを刻子
  if (windCount >= 12) {
    yakuList.push({
      yakuName: "大四喜",
      possibility: "高い",
      description: `風牌が${windCount}枚あるため、大四喜を狙えます。大四喜は13翻の役満で、風牌4種類すべてを刻子にする役です。`
    });
  }

  // 小三元: 三元牌2種類を刻子、1種類を雀頭
  if (sangenCount >= 7 && sangenCount < 9) {
    yakuList.push({
      yakuName: "小三元",
      possibility: "中程度",
      description: `三元牌が${sangenCount}枚あるため、小三元を狙えます。小三元は2翻の役で、三元牌2種類を刻子、1種類を雀頭にする役です。`
    });
  }

  // 三槓子: 槓子3つ（今回は刻子で代替）
  if (possibleMelds.triplets.length >= 3) {
    yakuList.push({
      yakuName: "三槓子",
      possibility: "低い",
      description: `刻子が${possibleMelds.triplets.length}個あるため、三槓子の可能性があります。三槓子は2翻の役で、槓子を3つ作る役です。`
    });
  }

  // 対々和: 刻子3つ+対子1つ
  if (possibleMelds.triplets.length >= 3 && possibleMelds.pairs.length >= 1) {
    yakuList.push({
      yakuName: "対々和",
      possibility: "中程度",
      description: `刻子${possibleMelds.triplets.length}個と対子${possibleMelds.pairs.length}個あるため、対々和を狙えます。対々和は2翻の役で、刻子3つ+対子1つで手牌を作る役です。`
    });
  }

  // 一気通貫: 順子で1-9の連続（萬子）
  const manSequences = possibleMelds.sequences.filter((seq: string[]) => seq[0].endsWith('m'));
  if (manSequences.length >= 3) {
    yakuList.push({
      yakuName: "一気通貫（萬子）",
      possibility: "低い",
      description: `萬子の順子が${manSequences.length}個あるため、一気通貫の可能性があります。一気通貫は2翻の役で、同色で1-9の連続する順子を作る役です。`
    });
  }

  // 一気通貫: 順子で1-9の連続（筒子）
  const pinSequences = possibleMelds.sequences.filter((seq: string[]) => seq[0].endsWith('p'));
  if (pinSequences.length >= 3) {
    yakuList.push({
      yakuName: "一気通貫（筒子）",
      possibility: "低い",
      description: `筒子の順子が${pinSequences.length}個あるため、一気通貫の可能性があります。一気通貫は2翻の役で、同色で1-9の連続する順子を作る役です。`
    });
  }

  // 一気通貫: 順子で1-9の連続（索子）
  const souSequences = possibleMelds.sequences.filter((seq: string[]) => seq[0].endsWith('s'));
  if (souSequences.length >= 3) {
    yakuList.push({
      yakuName: "一気通貫（索子）",
      possibility: "低い",
      description: `索子の順子が${souSequences.length}個あるため、一気通貫の可能性があります。一気通貫は2翻の役で、同色で1-9の連続する順子を作る役です。`
    });
  }

  // 三色同順: 萬子・筒子・索子で同じ数字の順子
  const allSequences = possibleMelds.sequences;
  if (allSequences.length >= 3) {
    yakuList.push({
      yakuName: "三色同順",
      possibility: "低い",
      description: `順子が${allSequences.length}個あるため、三色同順の可能性があります。三色同順は2翻の役で、萬子・筒子・索子で同じ数字の順子を作る役です。`
    });
  }

  // 三色同刻: 萬子・筒子・索子で同じ数字の刻子
  if (possibleMelds.triplets.length >= 3) {
    yakuList.push({
      yakuName: "三色同刻",
      possibility: "低い",
      description: `刻子が${possibleMelds.triplets.length}個あるため、三色同刻の可能性があります。三色同刻は2翻の役で、萬子・筒子・索子で同じ数字の刻子を作る役です。`
    });
  }

  // 一盃口: 同じ順子が2つ
  const sequenceCounts: { [key: string]: number } = {};
  allSequences.forEach((seq: string[]) => {
    const key = seq.join(',');
    sequenceCounts[key] = (sequenceCounts[key] || 0) + 1;
  });
  const duplicateSequences = Object.values(sequenceCounts).filter(count => count >= 2).length;
  if (duplicateSequences >= 1) {
    yakuList.push({
      yakuName: "一盃口",
      possibility: "中程度",
      description: `同じ順子が${duplicateSequences}組あるため、一盃口を狙えます。一盃口は1翻の役で、同じ順子を2つ作る役です。`
    });
  }

  // 二盃口: 同じ順子の組み合わせが2つ
  if (duplicateSequences >= 2) {
    yakuList.push({
      yakuName: "二盃口",
      possibility: "中程度",
      description: `同じ順子が${duplicateSequences}組あるため、二盃口を狙えます。二盃口は3翻の役で、同じ順子の組み合わせを2つ作る役です。`
    });
  }

  return yakuList;
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

    // 塔子（ターツ）を探す（順子で使用されていない牌のみ）
    // 連続する2枚（例：3s4s）
    for (let i = 1; i <= 8; i++) {
      if (numbers.includes(i) && numbers.includes(i + 1) &&
        !usedInSequences.has(i) && !usedInSequences.has(i + 1)) {
        taatsu.push([`${i}${suit}`, `${i + 1}${suit}`]);
      }
    }

    // 1枚抜けの2枚（例：3s5s）
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
function generatePrompt(tiles: string[], handTiles: string[]): string {
  const selectedCount = handTiles.length;
  const japaneseTiles = convertTilesToJapanese(tiles);
  const japaneseHandTiles = convertTilesToJapanese(handTiles);

  // 牌の種類別枚数を事前計算
  const tileCounts = countTilesByType(tiles);
  const handTileCounts = countTilesByType(handTiles);

  // 順子・刻子を事前計算
  const possibleMelds = findPossibleMelds(tiles);

  let prompt = `あなたは麻雀を熟知し、思考力が長けているプロ雀士です。普通の麻雀とは全く違うルールだが以下のルールをよく理解し、最適な手牌選択や戦略を提案してください。

【ゲームルール】
この二人麻雀ゲームは以下のオリジナルルールです：

1. **基本ルール**:
   - プレイヤーは2人
   - 各プレイヤーにランダムに34枚を配布
   - プレイヤーは34枚から13枚を選択して手牌を作成
   - 残りの21枚が捨て牌候補となる

2. **特徴的なルール**:
   - 対局中は手牌13枚が固定、捨て牌は残りの21枚から選択

3. **基本形について**:
   - **基本形**: 4面子1雀頭の形（順子・刻子の組み合わせ）
   - **順子**: 連続する3枚の数牌（例：1m2m3m）
   - **刻子**: 同じ牌3枚（例：東東東）
   - **雀頭**: 同じ牌2枚（例：白白）

4. **牌の表記**:
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
**利用可能な牌から作れそうな役を分析し、その役について説明してください。**

【役の分析対象】
以下のすべての役について、利用可能な牌から作れそうなものを分析してください：

**役満系**:
- 国士無双: 19字牌で12種類以上
- 四暗刻: 刻子4個以上
- 字一色: 字牌のみ
- 清老頭: 老頭牌（1,9）のみ
- 緑一色: 緑色の牌のみ
- 大三元: 三元牌（白・發・中）をすべて刻子
- 小四喜: 風牌3種類を刻子、1種類を雀頭
- 大四喜: 風牌4種類すべてを刻子
- 四槓子: 槓子4つ
- 九蓮宝燈: 同色で1112345678999+任意1枚
- 純正九蓮宝燈: 九蓮宝燈の完全形

**高得点役**:
- 清一色: 萬子/筒子/索子のいずれかが13枚以上
- 混一色: 萬子+字牌、筒子+字牌、索子+字牌で13枚以上
- 三暗刻: 刻子3個以上
- 七対子: 対子6個以上
- 一気通貫: 順子で1-9の連続
- 三色同順: 萬子・筒子・索子で同じ数字の順子
- 二盃口: 同じ順子の組み合わせが2つ
- 純全帯么九: 老頭牌を含む順子・刻子のみ
- 混全帯么九: 老頭牌または字牌を含む順子・刻子のみ
- 混老頭: 老頭牌と字牌のみ
- 三色同刻: 萬子・筒子・索子で同じ数字の刻子
- 小三元: 三元牌2種類を刻子、1種類を雀頭
- 三槓子: 槓子3つ
- 対々和: 刻子3つ+対子1つ

**基本役**:
- 平和: 順子のみで雀頭は老頭牌以外
- 断么九: 2-8の数牌のみ
- 一盃口: 同じ順子が2つ
- 立直: 門前で聴牌宣言
- 一発: 立直後1巡以内で和了
- 門前清自摸和: 門前で自摸和了
- 槍槓: 槓子完成時に和了
- 嶺上開花: 槓ドラで和了
- 海底摸月: 最後の牌で和了
- 河底撈魚: 最後の牌をロン和了

**役牌**:
- 自風牌: 自分の風の刻子・雀頭
- 場風牌: 場の風の刻子・雀頭
- 白・發・中: 三元牌の刻子・雀頭

【出力形式】
以下のJSON形式で出力してください：

\`\`\`json
{
  "analysis": "牌種分析（萬子○枚、筒子○枚、索子○枚、字牌○枚）と作れそうな役の簡潔な説明",
  "yakuAnalysis": [
    {
      "yakuName": "清一色",
      "possibility": "高い/中程度/低い",
      "description": "萬子が13枚以上あるため、清一色を狙えます。清一色は6翻の高得点役で、同じ色の牌だけで手牌を作る役です。"
    },
    {
      "yakuName": "七対子",
      "possibility": "中程度",
      "description": "対子が6個以上あるため、七対子を狙えます。七対子は2翻の役で、7つの対子で手牌を完成させる特殊な形です。"
    }
  ]
}
\`\`\`

【注意事項】
- 初心者にも理解しやすい自然言語で説明してください
- 事前計算された面子情報を最大限活用してください
- 牌の表記は必ず「1m,2m,3m」のような形式で記述し、視覚的に分かりやすくしてください`;

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

      // プロンプトを生成
      const prompt = generatePrompt(body.tiles, body.handTiles);
      console.log('Sending request to Gemini API...');
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.3,  // 一貫性を重視
          topP: 0.8,        // 多様性を適度に保つ
          maxOutputTokens: 4096,  // より多くの回答長を確保
          thinkingConfig: {
            thinkingBudget: 0, // 思考機能を無効化してスピード優先
          },
        }
      });

      const text = response.text || '';

      console.log('Response length:', text.length);

      // JSONレスポンスを解析
      let parsedResponse;
      try {
        console.log('Raw response text:', text.substring(0, 500) + '...');

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

        console.log('Extracted JSON string:', jsonString.substring(0, 300) + '...');

        // JSON文字列が空でない場合のみ解析を試行
        if (jsonString.trim()) {
          parsedResponse = JSON.parse(jsonString);
        } else {
          throw new Error('Empty JSON string');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse JSON. Using fallback response.');

        // JSON解析に失敗した場合はテキストをそのまま使用し、空の提案を返す
        parsedResponse = {
          analysis: text,
          yakuAnalysis: []
        };
      }

      // 順子・刻子を事前計算
      const possibleMelds = findPossibleMelds(body.tiles);
      const tileCounts = countTilesByType(body.tiles);

      // 役を自動検出
      const detectedYaku = detectPossibleYaku(body.tiles, possibleMelds, tileCounts);

      // レスポンスを新しい形式に変換
      const suggestions = {
        patterns: [{
          // 基本情報
          tiles: body.handTiles,
          waitingTiles: [],
          analysis: parsedResponse.analysis || text,
          source: "gemini",
          melds: possibleMelds,
          tileCounts: tileCounts,

          // 役の分析
          yakuAnalysis: parsedResponse.yakuAnalysis || detectedYaku || []
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
            analysis: "Gemini APIが利用できないため、基本的な提案を表示しています。",
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