import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

// el proxy corre antes de cada pagina
// solo revisa si hay una cookie valida, no consulta la base de datos (eso lo hace el dal)
const PUBLIC_ROUTES = ['/login']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isPublic = PUBLIC_ROUTES.includes(path)
  const session = await decrypt(req.cookies.get('session')?.value)

  // sin sesion y queriendo entrar al panel -> al login
  if (!isPublic && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // ya tiene sesion y abre el login -> al inicio
  if (isPublic && session) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

// rutas donde no corre el proxy (archivos estaticos)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
