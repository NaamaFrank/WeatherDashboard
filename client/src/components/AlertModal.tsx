import { useEffect } from "react";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  variant?: "success" | "error" | "warning" | "info";
}

export default function AlertModal({
  isOpen,
  title,
  message,
  onClose,
  variant = "info"
}: AlertModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          icon: "✅",
          iconBg: "bg-green-100 text-green-600",
          border: "border-green-200"
        };
      case "error":
        return {
          icon: "❌",
          iconBg: "bg-red-100 text-red-600",
          border: "border-red-200"
        };
      case "warning":
        return {
          icon: "⚠️",
          iconBg: "bg-yellow-100 text-yellow-600",
          border: "border-yellow-200"
        };
      default:
        return {
          icon: "ℹ️",
          iconBg: "bg-blue-100 text-blue-600",
          border: "border-blue-200"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full border-2 ${styles.border}`}>
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
        <div className="p-6 border-t bg-gray-50 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
