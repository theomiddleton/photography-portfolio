export interface UserSession {
  email: string
  role: 'admin' | 'user'
  id: number
  sessionToken?: string
  exp: number
  iat: number
}

export interface SessionPayload {
  email: string
  role: 'admin' | 'user'
  id: number
  sessionToken?: string
}
