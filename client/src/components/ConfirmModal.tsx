import { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "info"
}: ConfirmModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
          icon: "🗑️",
          iconBg: "bg-red-100 text-red-600"
        };
      case "warning":
        return {
          confirmBtn: "bg-yellow-600 hover:bg-yellow-700 text-white",
          icon: "⚠️",
          iconBg: "bg-yellow-100 text-yellow-600"
        };
      default:
        return {
          confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
          icon: "ℹ️",
          iconBg: "bg-blue-100 text-blue-600"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center text-xl`}>
              {styles.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
