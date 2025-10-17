import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { tiles, dora } = await request.json();

    if (!tiles || !dora) {
      return NextResponse.json(
        { error: 'Missing required parameters (tiles, dora)' },
        { status: 400 }
      );
    }

    // Pythonスクリプトのパス
    const pythonScriptPath = path.join(process.cwd(), 'python', 'cpu_tenpai_generator.py');

    return new Promise<Response>((resolve) => {
      const pythonProcess = spawn('python3', [pythonScriptPath, JSON.stringify({ tiles, dora })]);

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
            resolve(NextResponse.json(result));
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            resolve(NextResponse.json(
              { error: 'Failed to parse Python output', details: output },
              { status: 500 }
            ));
          }
        } else {
          console.error('Python process error:', errorOutput);
          resolve(NextResponse.json(
            { error: 'Python process failed', details: errorOutput },
            { status: 500 }
          ));
        }
      });
    });

  } catch (error) {
    console.error('CPU tenpai generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
