type ActionButtonProps = {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit";
  isDisabled?: boolean;
  name?: string;
  value?: string;
  isProcessing?: boolean;
  customClasses?: string;
};

export function ActionButton({
  text,
  onClick,
  type = "button",
  isDisabled,
  name,
  value,
  isProcessing = false,
  customClasses = "",
}: ActionButtonProps) {
  return (
    <button
      type={type}
      name={name}
      value={value}
      className={`
        flex h-12 items-center justify-center gap-2 rounded-md
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
      {isProcessing && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}

      <span>{isProcessing ? "Processing..." : text}</span>
    </button>
  );
}
