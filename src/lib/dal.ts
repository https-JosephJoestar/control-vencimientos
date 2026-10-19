import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { readSession } from '@/lib/session'

// DAL = data access layer, aca se revisa quien es el usuario antes de tocar datos
// el proxy solo hace un chequeo rapido, la seguridad de verdad esta aca

// cache hace que si varias partes de la misma pagina lo llaman solo consulte la base una vez
export const getCurrentUser = cache(async () => {
  const session = await readSession()
  if (!session) redirect('/login')

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, branchId: true, active: true, branch: true },
  })

  // si lo desactivaron o lo borraron la cookie ya no sirve
  if (!user || !user.active) redirect('/login')

  return user
})

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (user.role !== 'ADMIN') redirect('/')
  return user
}

// filtro para las consultas de lotes: el admin ve todo, el encargado solo su sede
export async function branchFilter() {
  const user = await getCurrentUser()
  return user.role === 'ADMIN' ? {} : { branchId: user.branchId ?? -1 }
}
