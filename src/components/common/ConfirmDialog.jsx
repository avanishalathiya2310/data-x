import React from "react";

const ConfirmDialog = ({
  open,
  title = "Confirm",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  onCancel,
  onConfirm,
  busy = false,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative z-61 w-full max-w-md rounded-lg bg-white dark:bg-dark-secondary shadow-xl">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="p-5 text-sm text-gray-600 dark:text-gray-300">
          {description}
        </div>
        <div className="p-5 pt-0 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-4 py-2 text-sm cursor-pointer"
            disabled={busy}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-md px-4 py-2 text-sm text-white shadow cursor-pointer ${
              destructive
                ? "bg-red-600 hover:bg-red-700 disabled:opacity-60"
                : "bg-[#089bab] hover:bg-[#089bab]/80 disabled:opacity-60"
            }`}
          >
            {busy ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
