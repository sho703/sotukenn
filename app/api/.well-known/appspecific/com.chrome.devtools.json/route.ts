import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    workspace: {
      root: process.cwd(),
      uuid: 'mahjong-game-workspace-001'
    }
  });
}
