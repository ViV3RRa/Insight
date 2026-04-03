import { create } from 'zustand'

type ToastVariant = 'success' | 'info' | 'error' | 'undo'

interface ToastItem {
  id: string
  variant: ToastVariant
  message: string
  onUndo?: () => void
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => string
  removeToast: (id: string) => void
}

let counter = 0

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++counter}`
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    return id
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

const toast = {
  success: (message: string) =>
    useToastStore.getState().addToast({ variant: 'success', message }),
  info: (message: string) =>
    useToastStore.getState().addToast({ variant: 'info', message }),
  error: (message: string) =>
    useToastStore.getState().addToast({ variant: 'error', message }),
  undo: (message: string, onUndo: () => void) =>
    useToastStore.getState().addToast({ variant: 'undo', message, onUndo }),
}

export { useToastStore, toast }
export type { ToastVariant, ToastItem, ToastStore }
