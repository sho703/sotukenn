import React from "react";

type Props = {
  disabled?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
};

const ConfirmButton: React.FC<Props> = ({
  disabled = false,
  onClick,
  children = "確定",
}) => (
  <button
    type="button"
    className={`py-2 px-6 rounded bg-blue-600 text-white font-bold transition
      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}
    `}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

export default ConfirmButton;