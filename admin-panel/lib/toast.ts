type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
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
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

type ToastListener = (toasts: ToastMessage[]) => void;
type ConfirmListener = (confirmState: ConfirmOptions | null) => void;

class ToastManager {
  private toasts: ToastMessage[] = [];
  private toastListeners: ToastListener[] = [];
  private confirmListeners: ConfirmListener[] = [];

  subscribe(listener: ToastListener) {
    this.toastListeners.push(listener);
    listener([...this.toasts]);
    return () => {
      this.toastListeners = this.toastListeners.filter(l => l !== listener);
    };
  }

  subscribeConfirm(listener: ConfirmListener) {
    this.confirmListeners.push(listener);
    return () => {
      this.confirmListeners = this.confirmListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.toastListeners.forEach(l => l([...this.toasts]));
  }

  show(message: string, type: ToastType = 'info', duration = 3500) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { id, type, message, duration };
    this.toasts.push(newToast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, duration = 3500) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3500) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 3500) {
    this.show(message, 'warning', duration);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  confirm(options: ConfirmOptions) {
    this.confirmListeners.forEach(l => l(options));
  }

  closeConfirm() {
    this.confirmListeners.forEach(l => l(null));
  }
}

export const toast = new ToastManager();
export const confirmDialog = (options: ConfirmOptions) => toast.confirm(options);

