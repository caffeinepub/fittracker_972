import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import Modal from "./Modal";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  autoClose = true,
  autoCloseDelay = 3000,
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={48} className="text-green-500" />;
      case "error":
        return <XCircle size={48} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={48} className="text-yellow-500" />;
      case "info":
        return <Info size={48} className="text-blue-500" />;
      default:
        return <Info size={48} className="text-blue-500" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "error":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">{getIcon()}</div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <button
          onClick={onClose}
          className={`px-6 py-2 transition-colors ${getButtonClass()}`}
        >
          OK
        </button>
      </div>
    </Modal>
  );
};

export default NotificationModal;
