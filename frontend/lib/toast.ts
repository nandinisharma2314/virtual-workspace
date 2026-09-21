export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

type ToastListener = (toast: ToastItem) => void;
type ConfirmListener = (options: ConfirmOptions | null) => void;

class ToastManager {
  private toastListeners: Set<ToastListener> = new Set();
  private confirmListeners: Set<ConfirmListener> = new Set();

  subscribeToast(listener: ToastListener) {
    this.toastListeners.add(listener);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  subscribeConfirm(listener: ConfirmListener) {
    this.confirmListeners.add(listener);
    return () => {
      this.confirmListeners.delete(listener);
    };
  }

  show(type: ToastType, message: string, duration = 3500) {
    const item: ToastItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      duration,
    };
    this.toastListeners.forEach((listener) => listener(item));
  }

  success(message: string, duration?: number) {
    this.show("success", message, duration);
  }

  error(message: string, duration?: number) {
    this.show("error", message, duration);
  }

  info(message: string, duration?: number) {
    this.show("info", message, duration);
  }

  warning(message: string, duration?: number) {
    this.show("warning", message, duration);
  }

  confirm(options: ConfirmOptions) {
    this.confirmListeners.forEach((listener) => listener(options));
  }

  closeConfirm() {
    this.confirmListeners.forEach((listener) => listener(null));
  }
}

export const toast = new ToastManager();
export const confirmDialog = (options: ConfirmOptions) => toast.confirm(options);

