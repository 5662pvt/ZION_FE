import { toast as originalToast, type ToastOptions } from "react-toastify";

const toast = {
  success: (msg: string, options: ToastOptions = {}) =>
    originalToast.success(msg, {
      autoClose: 5000,
      closeOnClick: true,
      closeButton: false,
      ...options,
    }),

  info: (msg: string, options: ToastOptions = {}) =>
    originalToast.info(msg, {
      autoClose: 5000,
      closeOnClick: true,
      closeButton: false,
      ...options,
    }),

  warn: (msg: string, options: ToastOptions = {}) =>
    originalToast.warn(msg, {
      autoClose: 10000,
      closeOnClick: true,
      closeButton: false,
      ...options,
    }),

  warning: (msg: string, options: ToastOptions = {}) =>
    originalToast.warn(msg, { autoClose: 10000, ...options }),

  error: (msg: string, options: ToastOptions = {}) =>
    originalToast.error(msg, {
      autoClose: false,
      closeOnClick: true,
      closeButton: false,
      draggable: false,
      ...options,
    }),

  dismiss: originalToast.dismiss,
  isActive: originalToast.isActive,
  update: originalToast.update,
  done: originalToast.done,
  loading: originalToast.loading,
};

export { toast };
