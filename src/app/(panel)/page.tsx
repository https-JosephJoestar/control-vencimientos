import { db } from '@/lib/db'
import { branchFilter, getCurrentUser } from '@/lib/dal'

export default async function HomePage() {
  const user = await getCurrentUser()
  const where = await branchFilter()

  // por ahora solo cuenta lotes por sede, el semaforo de vencimientos es del dia 7-8
  const branches = await db.branch.findMany({
    where: user.role === 'ADMIN' ? {} : { id: user.branchId ?? -1 },
    orderBy: { id: 'asc' },
    include: { _count: { select: { lots: true } } },
  })
  const totalLots = await db.lot.count({ where })

  return (
    <div>
      <h1 className="text-2xl font-bold">Hola, {user.name.split(' ')[0]}</h1>
      <p className="mt-1 text-slate-500">Hay {totalLots} lotes registrados.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {branches.map((branch) => (
          <div key={branch.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{branch.isWarehouse ? 'Bodega' : 'Farmacia'}</p>
            <p className="font-semibold">{branch.name}</p>
            <p className="mt-3 text-3xl font-bold">{branch._count.lots}</p>
            <p className="text-sm text-slate-500">lotes</p>
          </div>
        ))}
      </div>
    </div>
  )
}
