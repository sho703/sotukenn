import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { tiles } = await request.json();

    // Pythonスクリプトへの入力データ
    const inputData = JSON.stringify({ action: 'check_tenpai', tiles });

    // Pythonスクリプトのパス
    const pythonScriptPath = path.join(process.cwd(), 'python', 'mahjong_checker.py');

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [pythonScriptPath, inputData]);

      let pythonOutput = '';
      let pythonError = '';

      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}: ${pythonError}`);
          return reject(NextResponse.json({ error: `Python script error: ${pythonError}` }, { status: 500 }));
        }

        try {
          const result = JSON.parse(pythonOutput);
          resolve(NextResponse.json(result));
        } catch (parseError) {
          console.error('Failed to parse Python script output:', pythonOutput, parseError);
          reject(NextResponse.json({ error: 'Failed to parse Python script output' }, { status: 500 }));
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python subprocess:', err);
        reject(NextResponse.json({ error: `Failed to start Python subprocess: ${err.message}` }, { status: 500 }));
      });
    });
  } catch (error) {
    console.error('API request error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
