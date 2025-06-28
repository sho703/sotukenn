import { NextResponse } from 'next/server';
import { TenpaiSuggestionRequest } from '@/types';
import { analyzeTenpai } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json() as TenpaiSuggestionRequest;

    // バリデーション
    if (!body.tiles || !Array.isArray(body.tiles) || body.tiles.length !== 34) {
      return NextResponse.json(
        { error: '配牌は34枚必要です' },
        { status: 400 }
      );
    }

    if (!body.handTiles || !Array.isArray(body.handTiles) || body.handTiles.length > 13) {
      return NextResponse.json(
        { error: '手牌は13枚以下である必要があります' },
        { status: 400 }
      );
    }

    // Gemini APIを使用して聴牌形を分析
    const suggestions = await analyzeTenpai(body.tiles);

    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 