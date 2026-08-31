type PaginationButtonProps = {
  onClick: () => void;
  isDisabled: boolean;
  text: string;
};

export function PaginationButton({
  onClick,
  isDisabled,
  text,
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
    >
      {text}
    </button>
  );
}
