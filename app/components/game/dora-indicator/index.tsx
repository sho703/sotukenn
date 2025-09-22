import { Card, CardContent } from "@/components/ui/card"
import { getTileImagePath } from "@/app/lib/mahjong"
import Image from "next/image"

interface Props {
  dora: string;
}

export function DoraIndicator({ dora }: Props) {
  const tileImagePath = getTileImagePath(dora);

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="flex items-center gap-2 p-2">
        <span className="font-bold text-gray-600">ドラ:</span>
        <div className="relative w-8 h-12">
          <Image
            src={tileImagePath}
            alt={`ドラ ${dora}`}
            fill
            className="object-contain"
          />
        </div>
      </CardContent>
    </Card>
  );
} 