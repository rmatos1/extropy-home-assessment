import { createPortal } from "react-dom";

type LogoutModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
};

export function LogoutModal({
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 id="logout-modal-title" className="text-xl font-bold text-gray-900">
          Log out
        </h2>

        <p className="mt-2 text-gray-600">Are you sure you want to log out?</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded-md bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Log out"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
