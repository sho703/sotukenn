import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      colors: {
        // 麻雀風カラーパレット
        mahjong: {
          // テーブル（緑のフェルト調）
          table: {
            50: 'var(--mahjong-table-50)',
            100: 'var(--mahjong-table-100)',
            200: 'var(--mahjong-table-200)',
            300: 'var(--mahjong-table-300)',
            400: 'var(--mahjong-table-400)',
            500: 'var(--mahjong-table-500)',
            600: 'var(--mahjong-table-600)',
            700: 'var(--mahjong-table-700)',
            800: 'var(--mahjong-table-800)',
            900: 'var(--mahjong-table-900)',
          },
          // 赤（東、南、西、北、中、白、発）
          red: {
            50: 'var(--mahjong-red-50)',
            100: 'var(--mahjong-red-100)',
            200: 'var(--mahjong-red-200)',
            300: 'var(--mahjong-red-300)',
            400: 'var(--mahjong-red-400)',
            500: 'var(--mahjong-red-500)',
            600: 'var(--mahjong-red-600)',
            700: 'var(--mahjong-red-700)',
            800: 'var(--mahjong-red-800)',
            900: 'var(--mahjong-red-900)',
          },
          // 青（筒子、索子、萬子の一部）
          blue: {
            50: 'var(--mahjong-blue-50)',
            100: 'var(--mahjong-blue-100)',
            200: 'var(--mahjong-blue-200)',
            300: 'var(--mahjong-blue-300)',
            400: 'var(--mahjong-blue-400)',
            500: 'var(--mahjong-blue-500)',
            600: 'var(--mahjong-blue-600)',
            700: 'var(--mahjong-blue-700)',
            800: 'var(--mahjong-blue-800)',
            900: 'var(--mahjong-blue-900)',
          },
          // 金色（装飾用）
          gold: {
            50: 'var(--mahjong-gold-50)',
            100: 'var(--mahjong-gold-100)',
            200: 'var(--mahjong-gold-200)',
            300: 'var(--mahjong-gold-300)',
            400: 'var(--mahjong-gold-400)',
            500: 'var(--mahjong-gold-500)',
            600: 'var(--mahjong-gold-600)',
            700: 'var(--mahjong-gold-700)',
            800: 'var(--mahjong-gold-800)',
            900: 'var(--mahjong-gold-900)',
          },
          // 象牙色（牌の背景）
          ivory: {
            50: 'var(--mahjong-ivory-50)',
            100: 'var(--mahjong-ivory-100)',
            200: 'var(--mahjong-ivory-200)',
            300: 'var(--mahjong-ivory-300)',
            400: 'var(--mahjong-ivory-400)',
            500: 'var(--mahjong-ivory-500)',
            600: 'var(--mahjong-ivory-600)',
            700: 'var(--mahjong-ivory-700)',
            800: 'var(--mahjong-ivory-800)',
            900: 'var(--mahjong-ivory-900)',
          },
        },
      },
      fontFamily: {
        'japanese': ['var(--font-noto-sans-jp)', 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
        'serif-jp': ['var(--font-noto-serif-jp)', 'Noto Serif JP', 'Yu Mincho', 'serif'],
      },
      backgroundImage: {
        'mahjong-table': "radial-gradient(ellipse at center, #3a9d3a 0%, #2d7d2d 50%, #1e421e 100%)",
        'mahjong-pattern': "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
      },
      boxShadow: {
        'mahjong-tile': '0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        'mahjong-tile-hover': '0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
        'mahjong-button': '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
      },
      keyframes: {
        'dora-sparkle': {
          '0%, 100%': {
            opacity: '0.2',
            boxShadow: '0 0 10px rgba(250,204,21,0.3)',
          },
          '50%': {
            opacity: '1',
            boxShadow: '0 0 30px rgba(250,204,21,1)',
          },
        },
      },
      animation: {
        'dora-sparkle': 'dora-sparkle 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config; 