const API_URL = import.meta.env.VITE_API_URL

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
}

function getErrorMessage(errorData: unknown) {
  if (!errorData) {
    return ''
  }

  if (typeof errorData === 'string') {
    return errorData
  }

  if (typeof errorData !== 'object') {
    return ''
  }

  const data = errorData as Record<string, unknown>

  if (typeof data.detail === 'string') {
    return data.detail
  }

  if (typeof data.message === 'string') {
    return data.message
  }

  if (typeof data.error === 'string') {
    return data.error
  }

  const firstError = Object.entries(data)[0]

  if (!firstError) {
    return JSON.stringify(data)
  }

  const [field, value] = firstError

  if (Array.isArray(value)) {
    return `${field}: ${value.join(', ')}`
  }

  if (typeof value === 'string') {
    return `${field}: ${value}`
  }

  return JSON.stringify(data)
}

async function getResponseErrorText(response: Response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const errorData = await response.json().catch(() => null)
    const message = getErrorMessage(errorData)

    if (message) {
      return message
    }
  }

  const text = await response.text().catch(() => '')

  if (text) {
    return text.slice(0, 500)
  }

  return 'Произошла ошибка при запросе к серверу'
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
    const errorText = await getResponseErrorText(response)

    throw new ApiError(`HTTP ${response.status}: ${errorText}`, response.status)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}