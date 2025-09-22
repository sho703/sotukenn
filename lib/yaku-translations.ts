// 麻雀役名の英語→日本語翻訳辞書
export const yakuTranslations: Record<string, string> = {
  // 基本役
  'Riichi': 'リーチ',
  'Dora': 'ドラ',
  'Red Dora': '赤ドラ',
  'Ura Dora': '裏ドラ',
  'Kita': '北',

  // 1翻役
  'Tanyao': 'タンヤオ',
  'Pinfu': 'ピンフ',
  'Iipeikou': '一盃口',
  'Ikkitsuukan': '一気通貫',
  'Sanshoku Doujun': '三色同順',
  'Sanshoku Doukou': '三色同刻',
  'Sankantsu': '三槓子',
  'Toitoi': '対々和',
  'Sanankou': '三暗刻',
  'Shousangen': '小三元',
  'Honitsu': '混一色',
  'Chinitsu': '清一色',
  'Rinshan Kaihou': '嶺上開花',
  'Chankan': '槍槓',
  'Haitei Raoyue': '海底摸月',
  'Houtei Raoyui': '河底撈魚',

  // 2翻役
  'Double Riichi': 'ダブルリーチ',
  'Chiitoitsu': '七対子',
  'Honroutou': '混老頭',
  'Sanshoku Doukou': '三色同刻',
  'Sankantsu': '三槓子',
  'Toitoi': '対々和',
  'Sanankou': '三暗刻',
  'Shousangen': '小三元',
  'Honitsu': '混一色',
  'Chinitsu': '清一色',

  // 3翻役
  'Ryanpeikou': '二盃口',
  'Junchan': '純全帯么九',
  'Honroutou': '混老頭',

  // 6翻役
  'Suuankou': '四暗刻',
  'Suukantsu': '四槓子',
  'Tsuuiisou': '字一色',
  'Ryuuiisou': '緑一色',
  'Chinroutou': '清老頭',
  'Kokushimusou': '国士無双',
  'Kokushimusou 13': '国士無双十三面待ち',

  // 役満
  'Tenhou': '天和',
  'Chihou': '地和',
  'Renhou': '人和',
  'Daisangen': '大三元',
  'Shousuushii': '小四喜',
  'Daisuushii': '大四喜',
  'Tsuuiisou': '字一色',
  'Ryuuiisou': '緑一色',
  'Chinroutou': '清老頭',
  'Kokushimusou': '国士無双',
  'Kokushimusou 13': '国士無双十三面待ち',
  'Suuankou': '四暗刻',
  'Suukantsu': '四槓子',
  'Churen Poutou': '九蓮宝燈',
  'Churen Poutou 9': '純正九蓮宝燈',

  // その他
  'Unknown': '不明な役',
  'Random Win': 'ランダム和了',
  'CPU Special': 'CPU特殊役',
  '不明な役': '不明な役'
};

// 役名を日本語に変換する関数
export function translateYaku(yakuList: string[]): string[] {
  return yakuList.map(yaku => yakuTranslations[yaku] || yaku);
}
