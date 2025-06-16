import React from "react";

type Props = {
  dora: string;
};

const DoraIndicator: React.FC<Props> = ({ dora }) => (
  <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-300 rounded w-fit">
    <span className="font-bold text-gray-600">ドラ:</span>
    <span className="text-lg text-gray-800">{dora}</span>
  </div>
);

export default DoraIndicator;