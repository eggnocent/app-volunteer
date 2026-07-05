import { useCallback, useEffect, useState } from 'react'

export type AsyncResourceState<T> = {
  data: T
  error: string | null
  isLoading: boolean
  reload: () => Promise<void>
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  initialData: T,
): AsyncResourceState<T> {
  const [data, setData] = useState(initialData)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setData(await loader())
    } catch (resourceError) {
      setError(getErrorMessage(resourceError))
    } finally {
      setIsLoading(false)
    }
  }, [loader])

  useEffect(() => {
    queueMicrotask(() => {
      void reload()
    })
  }, [reload])

  return { data, error, isLoading, reload }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Data belum bisa dimuat dari API.'
}
