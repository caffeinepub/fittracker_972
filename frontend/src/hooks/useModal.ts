import { useState } from "react";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info" | "danger";
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showModal = (
    title: string,
    message: string,
    type: ModalState["type"] = "info",
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const hideModal = () => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const showSuccess = (title: string, message: string) => {
    showModal(title, message, "success");
  };

  const showError = (title: string, message: string) => {
    showModal(title, message, "error");
  };

  const showWarning = (title: string, message: string) => {
    showModal(title, message, "warning");
  };

  const showInfo = (title: string, message: string) => {
    showModal(title, message, "info");
  };

  return {
    modalState,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

export function useConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
  }>({
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning",
  });

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      type?: "danger" | "warning" | "info";
      confirmText?: string;
      cancelText?: string;
    },
  ) => {
    setConfirmationData({
      title,
      message,
      onConfirm,
      type: options?.type || "warning",
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
    });
    setIsOpen(true);
  };

  const hideConfirmation = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    confirmationData.onConfirm();
    hideConfirmation();
  };

  return {
    isOpen,
    confirmationData,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  };
}
