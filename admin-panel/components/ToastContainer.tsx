"use client";

import React, { useEffect, useState } from 'react';
import { toast, ToastMessage, ConfirmOptions } from '@/lib/toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const unsubToast = toast.subscribe(setToasts);
    const unsubConfirm = toast.subscribeConfirm(setConfirmState);
    return () => {
      unsubToast();
      unsubConfirm();
    };
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmState) return;
    try {
      setConfirmLoading(true);
      await confirmState.onConfirm();
    } finally {
      setConfirmLoading(false);
      toast.closeConfirm();
    }
  };

  const handleCancelAction = () => {
    if (confirmState?.onCancel) {
      confirmState.onCancel();
    }
    toast.closeConfirm();
  };

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
                isSuccess
                  ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/60'
                  : isError
                  ? 'bg-rose-950/90 text-rose-100 border-rose-700/60'
                  : isWarning
                  ? 'bg-amber-950/90 text-amber-100 border-amber-700/60'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700/60'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 size={18} className="text-emerald-400" />}
                {isError && <AlertCircle size={18} className="text-rose-400" />}
                {isWarning && <AlertTriangle size={18} className="text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info size={18} className="text-blue-400" />}
              </div>
              <div className="flex-1 text-[13px] font-medium leading-snug break-words">
                {t.message}
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="shrink-0 text-white/50 hover:text-white transition-colors p-0.5 rounded-md"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmState.type === 'danger'
                  ? 'bg-rose-50 text-rose-600'
                  : confirmState.type === 'warning'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-indigo-50 text-indigo-600'
              }`}>
                {confirmState.type === 'danger' && <AlertCircle size={22} strokeWidth={2.3} />}
                {confirmState.type === 'warning' && <AlertTriangle size={22} strokeWidth={2.3} />}
                {confirmState.type !== 'danger' && confirmState.type !== 'warning' && <Info size={22} strokeWidth={2.3} />}
              </div>
              <h3 className="text-base font-black text-gray-900 leading-tight">
                {confirmState.title || "Are you sure?"}
              </h3>
            </div>

            <p className="text-[13px] text-gray-600 leading-relaxed mb-6 pl-1 font-medium">
              {confirmState.message}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelAction}
                disabled={confirmLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {confirmState.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={confirmLoading}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold text-white transition-all shadow-md cursor-pointer ${
                  confirmState.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                {confirmLoading ? "Processing..." : (confirmState.confirmText || "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

