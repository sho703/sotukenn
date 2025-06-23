import { Card, CardContent } from "@/components/ui/card"

interface Props {
  dora: string;
}

export function DoraIndicator({ dora }: Props) {
  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardContent className="flex items-center gap-2 p-2">
        <span className="font-bold text-gray-600">ドラ:</span>
        <span className="text-lg text-gray-800">{dora}</span>
      </CardContent>
    </Card>
  );
} 