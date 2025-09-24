// 麻雀役名の英語→日本語翻訳辞書
// GitHubのmahjongライブラリのyaku_listに基づく
// 参考: https://github.com/MahjongRepository/mahjong/tree/master/mahjong/hand_calculating/yaku_list
export const yakuTranslations: Record<string, string> = {
  // 1翻役
  'Menzen Tsumo': '門前清自摸和',
  'Riichi': '立直',
  'Ippatsu': '一発',
  'Chankan': '槍槓',
  'Rinshan Kaihou': '嶺上開花',
  'Haitei Raoyue': '海底摸月',
  'Houtei Raoyui': '河底撈魚',
  'Pinfu': '平和',
  'Tanyao': '断么九',
  'Iipeiko': '一盃口',
  'Yakuhai (wind of seat)': '役牌（自風）',
  'Yakuhai (wind of round)': '役牌（場風）',
  'Yakuhai (white)': '役牌（白）',
  'Yakuhai (green)': '役牌（發）',
  'Yakuhai (red)': '役牌（中）',

  // 2翻役
  'Double Riichi': 'ダブル立直',
  'Chiitoitsu': '七対子',
  'Chanta': '混全帯么九',
  'Ikkitsuukan': '一気通貫',
  'Toitoi': '対々和',
  'San Ankou': '三暗刻',
  'Sanshoku Doukou': '三色同刻',
  'Sanshoku Doujun': '三色同順',
  'Honroutou': '混老頭',
  'Shousangen': '小三元',

  // 3翻役
  'Ryanpeikou': '二盃口',
  'Honitsu': '混一色',
  'Junchan': '純全帯么九',

  // 6翻役
  'Chinitsu': '清一色',

  // 役満
  'Renhou': '人和',
  'Tenhou': '天和',
  'Chiihou': '地和',
  'Daisangen': '大三元',
  'Suu Ankou': '四暗刻',
  'Suu Ankou Tanki': '四暗刻単騎',
  'Tsuuiisou': '字一色',
  'Ryuuiisou': '緑一色',
  'Chinroutou': '清老頭',
  'Kokushi Musou': '国士無双',
  'Kokushi Musou Juusanmen': '国士無双十三面待ち',
  'Shousuushii': '小四喜',
  'Daisuushii': '大四喜',
  'Suukantsu': '四槓子',
  'Chuuren Poutou': '九蓮宝燈',
  'Chuuren Poutou Kyuumen': '純正九蓮宝燈',

  // ドラ・その他
  'Dora': 'ドラ',
  'Ura Dora': '裏ドラ',
  'Aka Dora': '赤ドラ',
  'Tsumo': 'ツモ',

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
