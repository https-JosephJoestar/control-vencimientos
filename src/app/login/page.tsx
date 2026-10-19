import { LoginForm } from './login-form'

export const metadata = { title: 'Iniciar sesión · Control de vencimientos' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-4xl">💊</p>
          <h1 className="mt-2 text-2xl font-bold">Control de vencimientos</h1>
          <p className="mt-1 text-sm text-slate-500">Distribuidora y farmacias</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
