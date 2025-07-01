import { GoogleGenerativeAI } from '@google/generative-ai';
import { TileType, TenpaiSuggestionResponse } from '@/types';

// Gemini APIの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 麻雀牌を日本語表記に変換するヘルパー
function tileToJapanese(tile: TileType): string {
  // 字牌が直接日本語で来た場合はそのまま返す
  if (tile.length === 1 || ['東', '南', '西', '北', '白', '發', '中'].includes(tile)) {
    return tile;
  }

  const number = tile.charAt(0);
  const suit = tile.charAt(1);

  const suitMap: Record<string, string> = {
    'm': '萬',
    'p': '筒',
    's': '索',
    'z': ''
  };

  const honorTileMap: Record<string, string> = {
    '1': '東',
    '2': '南',
    '3': '西',
    '4': '北',
    '5': '白',
    '6': '發',
    '7': '中'
  };

  if (suit === 'z') {
    return honorTileMap[number];
  }

  return `${number}${suitMap[suit]}`;
}

// 牌リストを日本語表記に変換
function tilesToJapanese(tiles: TileType[]): string {
  return tiles.map(tileToJapanese).join(' ');
}

// 採用する役のリスト
const VALID_YAKU = [
  // 1翻
  "タンヤオ", "ピンフ", "イーペイコー", "役牌", "ドラ",
  // 2翻
  "七対子", "トイトイ", "三暗刻", "三色同順", "三色同刻",
  "混老頭", "一気通貫", "チャンタ",
  // 3翻
  "小三元", "混一色",
  // 3翻（食い下がりなし）
  "ジュンチャン", "リャンペイコー",
  // 6翻
  "清一色",
  // 役満
  "緑一色", "大三元", "小四喜", "字一色", "国士無双",
  "九蓮宝燈", "四暗刻", "清老頭"
];

export async function analyzeTenpai(
  allTiles: TileType[]
): Promise<TenpaiSuggestionResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  });

  const prompt = `
あなたは麻雀の聴牌形を分析する専門家です。
以下の34牌から13牌を選んで、聴牌形になる組み合わせを最大3つ提案してください。
絶対に34牌の中から13牌を選んでください。

選択可能な牌: ${tilesToJapanese(allTiles)}

以下のJSON形式で返してください（マークダウンの装飾は使用せず、純粋なJSONのみを返してください）：

{
  "patterns": [
    {
      "tiles": ["1m", "2m", "3m", ...],  // 手牌13枚（m=萬子、p=筒子、s=索子、z=字牌）
      "waitingTiles": [
        {
          "tile": "1m",  // 待ち牌（m=萬子、p=筒子、s=索子、z=字牌）
          "yaku": ["タンヤオ", "平和"]  // 成立する役のリスト
        }
      ]
    }
  ]
}

注意：
- 牌の表記は以下のルールに従ってください：
  - 萬子: 1m-9m
  - 筒子: 1p-9p
  - 索子: 1s-9s
  - 字牌: 1z-7z（1=東、2=南、3=西、4=北、5=白、6=發、7=中）
- 役は ${VALID_YAKU.join(', ')} の中から選んでください
- 点数の高い順に最大3つまで提案してください
- 待ち牌ごとに成立する役をすべて列挙してください
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // JSONの部分を抽出して解析
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from response');
      }
      const jsonStr = jsonMatch[0];

      const data = JSON.parse(jsonStr) as TenpaiSuggestionResponse;
      return data;
    } catch (parseError) {
      throw parseError;
    }
  } catch (error) {
    throw error;
  }
} 