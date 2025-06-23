'use client';

import { Card, CardContent } from "@/components/ui/card";

function TileSkeleton() {
  return (
    <Card className="inline-flex animate-pulse">
      <CardContent className="w-10 h-12 bg-gray-200" />
    </Card>
  );
}

export function HandZoneSkeleton() {
  return (
    <div className="min-h-14 flex flex-wrap gap-2 p-4 border-2 border-dashed border-blue-400 rounded bg-blue-50">
      {Array.from({ length: 13 }).map((_, i) => (
        <TileSkeleton key={i} />
      ))}
    </div>
  );
}

export function MahjongGridSkeleton() {
  return (
    <div className="grid grid-cols-8 gap-2 p-4 bg-gray-100 rounded">
      {Array.from({ length: 24 }).map((_, i) => (
        <TileSkeleton key={i} />
      ))}
    </div>
  );
}

export function DoraIndicatorSkeleton() {
  return (
    <Card className="bg-yellow-50 border-yellow-200 w-24 h-12 animate-pulse">
      <CardContent className="flex items-center justify-center">
        <div className="w-full h-6 bg-gray-200 rounded" />
      </CardContent>
    </Card>
  );
} 