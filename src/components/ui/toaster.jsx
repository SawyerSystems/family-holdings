import { useEffect, useState } from "react"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toasts = new Map()

const addToast = (toast) => {
  const id = genId()
  toasts.set(id, { ...toast, id })
  return id
}

const dismissToast = (id) => {
  toasts.delete(id)
}

export function Toaster() {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((i) => i + 1)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <ToastProvider>
      {Array.from(toasts.values()).map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose onClick={() => dismissToast(id)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

export function useToast() {
  const toast = (props) => {
    const id = addToast(props)

    // Auto-dismiss after delay unless manual flag is set
    if (!props.manual) {
      setTimeout(() => {
        dismissToast(id)
      }, TOAST_REMOVE_DELAY)
    }

    return id
  }

  return {
    toast,
    dismiss: dismissToast,
  }
}
