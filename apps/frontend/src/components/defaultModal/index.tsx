import { createPortal } from "react-dom";

type DefaultModalProps = {
  title: string;
  description: string;
  onClose: () => void;
  confirmTextButton: string;
  onConfirm: () => void;
  isProcessing?: boolean;
  processingText?: string;
};

export function DefaultModal({
  title,
  description,
  onClose,
  confirmTextButton,
  onConfirm,
  isProcessing,
  processingText,
}: DefaultModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl m-3">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>

        <p className="mt-3 text-gray-600">{description}</p>

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
            className="flex items-center rounded-md bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 gap-2"
          >
            {isProcessing && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {isProcessing ? processingText : confirmTextButton}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
