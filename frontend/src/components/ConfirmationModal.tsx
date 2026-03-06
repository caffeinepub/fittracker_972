import React from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import Modal from "./Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <XCircle size={48} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={48} className="text-yellow-500" />;
      case "info":
        return <CheckCircle size={48} className="text-blue-500" />;
      default:
        return <AlertTriangle size={48} className="text-yellow-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      default:
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">{getIcon()}</div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex space-x-3 justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 transition-colors disabled:opacity-50 flex items-center space-x-2 ${getConfirmButtonClass()}`}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
