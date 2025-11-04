import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

interface WinCheckRequest {
  tiles: string[];      // 手牌
  lastTile: string;     // 最後に加えた牌（和了牌）
  dora: string;         // ドラ表示牌
}

interface WinCheckResponse {
  isWinning: boolean;     // 和了かどうか
  points?: number;        // 点数（和了の場合）
  yaku?: string[];        // 成立した役（和了の場合）
  han?: number;          // 飜数
  fu?: number;           // 符数
}

// Pythonスクリプトを実行して和了判定（ローカル開発環境用）
async function checkWinWithPythonLocal(tiles: string[], lastTile: string, dora: string): Promise<WinCheckResponse> {
  return new Promise<WinCheckResponse>((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'mahjong_checker.py');

    const inputData = JSON.stringify({
      tiles: tiles,
      lastTile: lastTile,
      dora: dora
    });

    console.log('Python script input:', inputData);

    const python = spawn('python', [pythonScript, inputData]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorOutput);
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        console.log('Python script output:', output.trim());
        const result = JSON.parse(output.trim());
        resolve(result);
      } catch {
        console.error('Failed to parse Python output:', output);
        reject(new Error('Failed to parse Python script output'));
      }
    });
  });
}

// RenderのPython APIサーバーを呼び出す（本番環境用）
async function checkWinWithPythonAPI(tiles: string[], lastTile: string, dora: string): Promise<WinCheckResponse> {
  try {
    // 環境変数からPython APIのURLを取得
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';

    const response = await fetch(`${pythonApiUrl}/api/check-win`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tiles, lastTile, dora }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python API failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Python API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('API /check-win called');

  try {
    const body: WinCheckRequest = await request.json();
    console.log('Request body:', body);

    const { tiles, lastTile, dora } = body;

    // バリデーション
    if (!tiles || !Array.isArray(tiles) || tiles.length !== 13) {
      console.log('Validation failed: tiles count');
      return NextResponse.json(
        { error: '手牌は13枚である必要があります' },
        { status: 400 }
      );
    }

    if (!lastTile) {
      console.log('Validation failed: no lastTile');
      return NextResponse.json(
        { error: '和了牌が指定されていません' },
        { status: 400 }
      );
    }

    console.log('Starting Python script...');

    // Python スクリプトで和了判定
    try {
      // 環境変数でPython API URLが設定されている場合はAPIサーバーを使用
      // それ以外はローカルでPythonスクリプトを実行
      const usePythonAPI = !!process.env.PYTHON_API_URL;
      const result = usePythonAPI
        ? await checkWinWithPythonAPI(tiles, lastTile, dora)
        : await checkWinWithPythonLocal(tiles, lastTile, dora);
      console.log('Python script result:', result);
      return NextResponse.json(result);
    } catch (pythonError) {
      console.error('Python mahjong library error:', pythonError);
      return NextResponse.json(
        { error: 'Python和了判定エラー', isWinning: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('和了判定エラー:', error);
    return NextResponse.json(
      { error: '和了判定中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'POSTリクエストのみサポートしています' },
    { status: 405 }
  );
}