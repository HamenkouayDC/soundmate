const API_URL = import.meta.env.VITE_API_URL

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)

    throw new ApiError(
      errorData?.detail ||
        errorData?.message ||
        'Произошла ошибка при запросе к серверу',
      response.status,
    )
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}