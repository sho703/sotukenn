import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Pythonスクリプトを実行（ローカル開発環境用）
async function generateCpuTenpaiLocal(tiles: string[], dora: string, forceChiitoitsu: boolean) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(process.cwd(), 'python', 'cpu_tenpai_generator.py');

    const pythonProcess = spawn('python', [pythonScriptPath, JSON.stringify({ tiles, dora, forceChiitoitsu })]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${output}`));
        }
      } else {
        reject(new Error(`Python process failed: ${errorOutput}`));
      }
    });
  });
}

// RenderのPython APIサーバーを呼び出す（本番環境用）
async function generateCpuTenpaiAPI(tiles: string[], dora: string, forceChiitoitsu: boolean) {
  const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';

  const response = await fetch(`${pythonApiUrl}/api/generate-cpu-tenpai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tiles, dora, forceChiitoitsu }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Python API failed with status ${response.status}: ${errorText}`);
  }

  return await response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tiles, dora, forceChiitoitsu } = body;

    if (!tiles || !dora) {
      return NextResponse.json(
        { error: 'Missing required parameters (tiles, dora)' },
        { status: 400 }
      );
    }

    // 環境変数でPython API URLが設定されている場合はAPIサーバーを使用
    // それ以外はローカルでPythonスクリプトを実行
    const usePythonAPI = !!process.env.PYTHON_API_URL;
    const result = usePythonAPI
      ? await generateCpuTenpaiAPI(tiles, dora, forceChiitoitsu || false)
      : await generateCpuTenpaiLocal(tiles, dora, forceChiitoitsu || false);

    return NextResponse.json(result);

  } catch (error) {
    console.error('CPU tenpai generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
