import { apiClient } from './apiClient'

export type RegisterData = {
  email: string
  password: string
  display_name: string
}

export type LoginData = {
  email: string
  password: string
}

export type AuthTokens = {
  access: string
  refresh: string
}

export type RefreshTokenResponse = {
  access: string
  refresh?: string
}

export function registerUser(data: RegisterData) {
  return apiClient('/auth/register/', {
    method: 'POST',
    body: data,
  })
}

export function loginUser(data: LoginData) {
  return apiClient<AuthTokens>('/auth/login/', {
    method: 'POST',
    body: data,
  })
}

export function refreshAccessToken(refresh: string) {
  return apiClient<RefreshTokenResponse>('/auth/refresh/', {
    method: 'POST',
    body: {
      refresh,
    },
  })
}
