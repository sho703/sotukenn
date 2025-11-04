import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

interface TenpaiCheckRequest {
  tiles: string[];
  dora: string;
}

interface TenpaiCheckResponse {
  isTenpai: boolean;
  waitingTiles?: string[];
  error?: string;
}

// Pythonスクリプトを実行して聴牌判定（ローカル開発環境用）
async function checkTenpaiWithPythonLocal(tiles: string[], dora: string): Promise<TenpaiCheckResponse> {
  return new Promise<TenpaiCheckResponse>((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'tenpai_checker.py');

    const inputData = JSON.stringify({
      tiles: tiles,
      dora: dora
    });

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
async function checkTenpaiWithPythonAPI(tiles: string[], dora: string): Promise<TenpaiCheckResponse> {
  try {
    // 環境変数からPython APIのURLを取得
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';

    const response = await fetch(`${pythonApiUrl}/api/check-tenpai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tiles, dora }),
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
  try {
    const body: TenpaiCheckRequest = await request.json();
    const { tiles, dora } = body;

    // バリデーション
    if (!tiles || !Array.isArray(tiles) || tiles.length !== 13) {
      return NextResponse.json(
        { error: '手牌は13枚である必要があります' },
        { status: 400 }
      );
    }

    if (!dora) {
      return NextResponse.json(
        { error: 'ドラ表示牌が指定されていません' },
        { status: 400 }
      );
    }

    try {
      // 環境変数でPython API URLが設定されている場合はAPIサーバーを使用
      // それ以外はローカルでPythonスクリプトを実行
      const usePythonAPI = !!process.env.PYTHON_API_URL;
      const result = usePythonAPI
        ? await checkTenpaiWithPythonAPI(tiles, dora)
        : await checkTenpaiWithPythonLocal(tiles, dora);
      return NextResponse.json(result);
    } catch (pythonError) {
      console.error('Python tenpai check error:', pythonError);
      return NextResponse.json(
        { error: 'Python聴牌判定エラー', isTenpai: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('聴牌判定エラー:', error);
    return NextResponse.json(
      { error: '聴牌判定中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
