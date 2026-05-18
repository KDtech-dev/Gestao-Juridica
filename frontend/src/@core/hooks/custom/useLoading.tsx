import { useCallback, useState } from 'react'

export const useLoading = (initializedValues = false) => {
  const [loading, setLoading] = useState<boolean>(initializedValues)

  const startLoading = useCallback(() => setLoading(true), [])
  const stopLoading = useCallback(() => setLoading(false), [])

  return {
    loading,
    startLoading,
    stopLoading
  }
}
