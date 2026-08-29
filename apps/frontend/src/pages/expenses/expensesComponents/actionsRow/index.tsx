type ActionsRowProps = {
  isDisabled: boolean;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

const defaultClassNameButton =
  "text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

export function ActionsRow({
  isDisabled,
  onClickEdit,
  onClickDelete,
}: ActionsRowProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        className={`${defaultClassNameButton} text-blue-500 hover:text-blue-700`}
        onClick={onClickEdit}
        disabled={isDisabled}
      >
        Edit
      </button>

      <button
        type="button"
        className={`${defaultClassNameButton} text-red-500 hover:text-red-700`}
        onClick={onClickDelete}
        disabled={isDisabled}
      >
        Delete
      </button>
    </div>
  );
}
