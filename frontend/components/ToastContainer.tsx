"use client";

import { motion, AnimatePresence } from "framer-motion";

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
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-xl ${getToastStyle(
                t.type
              )}`}
            >
              <div className="mt-0.5">{getToastIcon(t.type)}</div>
              <div className="flex-1 text-[14px] font-medium leading-relaxed text-gray-800">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-900 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmOptions && (
          <motion.div
            key="confirm-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 sm:p-6"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-[400px] w-full border border-gray-100/50 flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decorative blob */}
            <div
              className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
                confirmOptions.variant === "danger"
                  ? "bg-rose-500"
                  : confirmOptions.variant === "warning"
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              }`}
            />

            <div className="flex flex-col items-center text-center relative z-10">
              <div
                className={`p-4 rounded-2xl mb-5 ${
                  confirmOptions.variant === "danger"
                    ? "bg-rose-50 text-rose-600 shadow-inner shadow-rose-100"
                    : confirmOptions.variant === "warning"
                    ? "bg-amber-50 text-amber-600 shadow-inner shadow-amber-100"
                    : "bg-indigo-50 text-indigo-600 shadow-inner shadow-indigo-100"
                }`}
              >
                {confirmOptions.variant === "danger" || confirmOptions.variant === "warning" ? (
                  <AlertTriangle size={32} strokeWidth={2} />
                ) : (
                  <Info size={32} strokeWidth={2} />
                )}
              </div>
              
              <h3 className={`text-[19px] font-bold text-gray-900 ${confirmOptions.message ? 'mb-2' : 'mb-8'}`}>
                {confirmOptions.title || "Confirm Action"}
              </h3>
              
              {!!confirmOptions.message && (
                <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-8 px-2">
                  {confirmOptions.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 w-full relative z-10">
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleCancel}
                className="flex-1 py-3 px-4 text-[14px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gray-200"
              >
                {confirmOptions.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                disabled={isConfirming}
                onClick={handleConfirmAction}
                className={`flex-1 py-3 px-4 text-[14px] font-semibold text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  confirmOptions.variant === "danger"
                    ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500 active:scale-[0.98]"
                    : confirmOptions.variant === "warning"
                    ? "bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-400 active:scale-[0.98]"
                    : "bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500 active:scale-[0.98]"
                } disabled:opacity-50`}
              >
                {isConfirming && <Loader2 size={16} className="animate-spin" />}
                <span>{confirmOptions.confirmText || "Confirm"}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

