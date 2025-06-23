import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import React from "react"

type Props = {
  disabled?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export const ConfirmButton: React.FC<Props> = ({
  disabled = false,
  onClick,
  children = "確定",
}) => {
  return (
    <Button
      type="button"
      variant="default"
      className={cn(
        "px-6 font-bold bg-blue-600 text-white hover:bg-blue-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export default ConfirmButton; 