import { createPortal } from "react-dom";

type DeleteExpenseModalProps = {
  expenseDescription: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteExpenseModal({
  expenseDescription,
  onClose,
  onConfirm,
}: DeleteExpenseModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Delete expense</h2>

        <p className="mt-3 text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">
            {expenseDescription}
          </span>
          ?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
