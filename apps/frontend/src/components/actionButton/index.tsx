type ActionButtonProps = {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit";
  isDisabled?: boolean;
  customClasses?: string;
};

export function ActionButton({
  text,
  onClick,
  type = "button",
  isDisabled,
  customClasses = "",
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={`
        h-12 rounded-md
        bg-linear-to-b from-blue-500 to-blue-600
        font-bold text-white
        cursor-pointer
        transition-all duration-200
        hover:from-blue-600 hover:to-blue-500
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${customClasses}
      `}
      onClick={onClick}
      disabled={isDisabled}
    >
      {text}
    </button>
  );
}
