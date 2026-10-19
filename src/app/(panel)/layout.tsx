import Link from 'next/link'
import { getCurrentUser } from '@/lib/dal'
import { logout } from '@/app/login/actions'

// layout de todas las paginas que necesitan sesion
// la carpeta (panel) va entre parentesis para que no aparezca en la url
export default async function PanelLayout({ children }: LayoutProps<'/'>) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="font-bold">
            💊 Vencimientos
          </Link>

          <nav className="flex gap-4 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">Inicio</Link>
            {/* TODO dia 3-4: pagina de lotes */}
            {/* TODO dia 5-6: pagina de importar (solo admin) */}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {user.name}
              <span className="ml-1 text-slate-400">· {user.branch?.name ?? 'Todas las sedes'}</span>
            </span>
            <form action={logout}>
              <button className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-100">Salir</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
