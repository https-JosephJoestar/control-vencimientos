import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// lo que guardo dentro de la cookie, solo lo minimo (nada de correos ni claves)
export type SessionPayload = {
  userId: number
  role: 'ADMIN' | 'BRANCH_MANAGER'
  branchId: number | null
}

const COOKIE_NAME = 'session'
const SESSION_DAYS = 7

const key = new TextEncoder().encode(process.env.SESSION_SECRET)

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key)
}

// devuelve null si la cookie no existe, esta vencida o la modificaron
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, key, { algorithms: ['HS256'] })
    return payload
  } catch {
    return null
  }
}

export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  const token = await encrypt(payload)
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // javascript del navegador no la puede leer
    secure: process.env.NODE_ENV === 'production', // en localhost no hay https
    sameSite: 'lax',
    expires,
    path: '/',
  })
}

export async function readSession() {
  const cookieStore = await cookies()
  return decrypt(cookieStore.get(COOKIE_NAME)?.value)
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
