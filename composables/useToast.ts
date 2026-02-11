export const useToast = () => {
  const toasts = useState<Toast[]>('toasts', () => [])

  const typeIcons: Record<string, string> = {
    info: 'lucide:info',
    success: 'lucide:check-circle',
    warning: 'lucide:alert-triangle',
    error: 'lucide:x-circle'
  }

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now()

    toasts.value.push({
      id,
      message,
      type,
      icon: typeIcons[type]
    })

    // Auto-dismiss après 4 secondes
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 4000)
  }

  return {
    showToast,
    toasts
  }
}

interface Toast {
  id: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  icon: string
}
