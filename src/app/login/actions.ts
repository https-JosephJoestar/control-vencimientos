'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/session'

// zod valida los datos del formulario y da mensajes de error
const loginSchema = z.object({
  email: z.email('Escribe un correo válido').trim().toLowerCase(),
  password: z.string().min(1, 'Escribe tu contraseña'),
})

export type LoginState = { error?: string; email?: string } | undefined

// useActionState le pasa el estado anterior como primer parametro
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  const email = String(formData.get('email') ?? '')

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, email }
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } })
  const passwordOk = user ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false

  // mismo mensaje si no existe o si la clave esta mal, asi no se sabe que correos existen
  if (!user || !passwordOk || !user.active) {
    return { error: 'Correo o contraseña incorrectos', email }
  }

  await createSession({ userId: user.id, role: user.role, branchId: user.branchId })
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
