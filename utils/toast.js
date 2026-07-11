// my-toast.js
import { toast as originalToast } from "react-toastify";

const toast = {
  success: (msg, options = {}) =>
    originalToast.success(msg, {
      autoClose: 5000,
      closeOnClick: true,
      closeButton: false,
      ...options,
    }),

  info: (msg, options = {}) =>
    originalToast.info(msg, {
      autoClose: 5000,
      closeOnClick: true,
      closeButton: false,
      ...options,
    }),

  warn: (msg, options = {}) =>
    originalToast.warn(msg, {
      autoClose: 10000,
      closeOnClick: true,
      closeButton: false,
      ...options,
    }),

  warning: (msg, options = {}) =>
    originalToast.warn(msg, { autoClose: 10000, ...options }),

  error: (msg, options = {}) =>
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
