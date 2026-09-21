"use client";

import { useEffect, useState, useCallback } from "react";
import {
  toast,
  ToastItem,
  ConfirmOptions,
} from "@/lib/toast";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unsubToast = toast.subscribeToast((item) => {
      setToasts((prev) => [...prev, item]);
      if (item.duration && item.duration > 0) {
        setTimeout(() => {
          removeToast(item.id);
        }, item.duration);
      }
    });

    const unsubConfirm = toast.subscribeConfirm((options) => {
      setConfirmOptions(options);
      setIsConfirming(false);
    });

    return () => {
      unsubToast();
      unsubConfirm();
    };
  }, [removeToast]);

  // Handle escape key for confirm modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmOptions) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmOptions]);

  const handleCancel = () => {
    if (confirmOptions?.onCancel) {
      confirmOptions.onCancel();
    }
    setConfirmOptions(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmOptions) return;
    setIsConfirming(true);
    try {
      await confirmOptions.onConfirm();
      setConfirmOptions(null);
    } catch (err) {
      console.error("Error executing confirm action:", err);
    } finally {
      setIsConfirming(false);
    }
  };

  const getToastIcon = (type: ToastItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />;
      case "error":
        return <AlertCircle className="text-rose-500 shrink-0" size={18} />;
      case "warning":
        return <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
      case "info":
      default:
        return <Info className="text-indigo-500 shrink-0" size={18} />;
    }
  };

  const getToastStyle = (type: ToastItem["type"]) => {
    switch (type) {
      case "success":
        return "border-emerald-200 bg-white text-emerald-900 shadow-emerald-500/10";
      case "error":
        return "border-rose-200 bg-white text-rose-900 shadow-rose-500/10";
      case "warning":
        return "border-amber-200 bg-white text-amber-900 shadow-amber-500/10";
      case "info":
      default:
        return "border-indigo-200 bg-white text-indigo-900 shadow-indigo-500/10";
    }
  };

  return (
    <>
      {/* Toast Notification Stack */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${getToastStyle(
              t.type
            )}`}
          >
            <div className="mt-0.5">{getToastIcon(t.type)}</div>
            <div className="flex-1 text-[13px] font-semibold leading-snug text-gray-800">
              {t.message}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmOptions && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  confirmOptions.variant === "danger"
                    ? "bg-rose-50 text-rose-600"
                    : confirmOptions.variant === "warning"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                {confirmOptions.variant === "danger" || confirmOptions.variant === "warning" ? (
                  <AlertTriangle size={24} strokeWidth={2.3} />
                ) : (
                  <Info size={24} strokeWidth={2.3} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-black text-gray-900 leading-tight">
                  {confirmOptions.title || "Confirm Action"}
                </h3>
                <p className="text-[13px] text-gray-600 font-medium leading-relaxed mt-1.5">
                  {confirmOptions.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 mt-2">
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleCancel}
                className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                {confirmOptions.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmAction}
                className={`px-4.5 py-2 text-[13px] font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                  confirmOptions.variant === "danger"
                    ? "bg-rose-600 hover:bg-rose-700 active:scale-95"
                    : confirmOptions.variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 active:scale-95"
                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                } disabled:opacity-50`}
              >
                {isConfirming && <Loader2 size={14} className="animate-spin" />}
                <span>{confirmOptions.confirmText || "Confirm"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

