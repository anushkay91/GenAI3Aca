import React from "react";
import { Modal } from "./common/Modal";
import { Trash2 } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Reflection"
      ariaDescribedBy="delete-warning-text"
    >
      <div className="space-y-4">
        <p id="delete-warning-text" className="text-sm text-neutral-600 leading-relaxed">
          Are you sure you want to delete this reflection and its companion insights? This action is permanent and cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:text-neutral-950 rounded-xl hover:bg-neutral-100 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50 min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
