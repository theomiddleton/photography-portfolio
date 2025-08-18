export interface UserSession {
  email: string
  role: 'admin' | 'user'
  id: number
  exp: number
  iat: number
}

export interface SessionPayload {
  email: string
  role: 'admin' | 'user'
  id: number
}