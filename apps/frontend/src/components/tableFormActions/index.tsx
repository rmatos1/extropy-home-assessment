type TableFormActionsProps = {
  isSaving: boolean;
  isEditing?: boolean;
  onCancel: () => void;
  form?: string;
};

export function TableFormActions({
  isSaving,
  isEditing,
  onCancel,
  form,
}: TableFormActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="submit"
        className="flex items-center rounded-md bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 gap-1"
        disabled={isSaving}
        form={form}
      >
        {isSaving && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        {isSaving ? "Saving..." : isEditing ? "Update" : "Save"}
      </button>

      <button
        type="button"
        className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </button>
    </div>
  );
}
