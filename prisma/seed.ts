// datos de prueba ficticios para desarrollo y para la demo
// se corre con: npx prisma db seed
// OJO: borra todo lo que haya en la base antes de crear los datos

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

// fecha de hoy mas o menos X dias, asi la demo siempre tiene lotes vencidos y por vencer
function daysFromToday(days: number) {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

async function main() {
  // borrar en orden por las relaciones (primero los hijos)
  await db.lotMovement.deleteMany()
  await db.lot.deleteMany()
  await db.product.deleteMany()
  await db.supplier.deleteMany()
  await db.user.deleteMany()
  await db.branch.deleteMany()

  const bodega = await db.branch.create({ data: { name: 'Bodega distribuidora', isWarehouse: true } })
  const principal = await db.branch.create({ data: { name: 'Farmacia principal' } })
  const sucursal = await db.branch.create({ data: { name: 'Farmacia sucursal' } })

  const passwordHash = await bcrypt.hash('Demo1234', 10)

  const admin = await db.user.create({
    data: { name: 'Administrador', email: 'admin@demo.com', passwordHash, role: 'ADMIN' },
  })
  await db.user.create({
    data: {
      name: 'Encargada principal',
      email: 'principal@demo.com',
      passwordHash,
      role: 'BRANCH_MANAGER',
      branchId: principal.id,
    },
  })
  await db.user.create({
    data: {
      name: 'Encargado sucursal',
      email: 'sucursal@demo.com',
      passwordHash,
      role: 'BRANCH_MANAGER',
      branchId: sucursal.id,
    },
  })

  const andina = await db.supplier.create({ data: { name: 'Mayorista Andina', returnWindowMonths: 6 } })
  const pacifico = await db.supplier.create({ data: { name: 'Laboratorios del Pacífico', returnWindowMonths: 3 } })
  const valle = await db.supplier.create({ data: { name: 'Distrimed Valle', returnWindowMonths: null } })

  // productos ficticios (los laboratorios son inventados)
  const products = [
    { siigoCode: 'MED-001', barcode: '7700000000011', name: 'Acetaminofén 500 mg x 100 tab', laboratory: 'Lab Aurora', unitCost: 6500, supplierId: andina.id },
    { siigoCode: 'MED-002', barcode: '7700000000028', name: 'Ibuprofeno 400 mg x 50 tab', laboratory: 'Lab Aurora', unitCost: 8200, supplierId: andina.id },
    { siigoCode: 'MED-003', barcode: '7700000000035', name: 'Loratadina 10 mg x 10 tab', laboratory: 'Genéricos Delta', unitCost: 2900, supplierId: pacifico.id },
    { siigoCode: 'MED-004', barcode: '7700000000042', name: 'Amoxicilina 500 mg x 50 cap', laboratory: 'Genéricos Delta', unitCost: 15400, supplierId: pacifico.id },
    { siigoCode: 'MED-005', barcode: '7700000000059', name: 'Omeprazol 20 mg x 30 cap', laboratory: 'Farma Sol', unitCost: 7800, supplierId: andina.id },
    { siigoCode: 'MED-006', barcode: '7700000000066', name: 'Losartán 50 mg x 30 tab', laboratory: 'Farma Sol', unitCost: 5600, supplierId: valle.id },
    { siigoCode: 'MED-007', barcode: '7700000000073', name: 'Metformina 850 mg x 30 tab', laboratory: 'Lab Aurora', unitCost: 4300, supplierId: valle.id },
    { siigoCode: 'MED-008', barcode: '7700000000080', name: 'Suero oral sabor fresa 500 ml', laboratory: 'Hidratar', unitCost: 3200, supplierId: pacifico.id },
    { siigoCode: 'MED-009', barcode: '7700000000097', name: 'Jarabe para la tos 120 ml', laboratory: 'Genéricos Delta', unitCost: 9900, supplierId: andina.id },
    { siigoCode: 'MED-010', barcode: '7700000000103', name: 'Vitamina C 1 g x 10 efervescentes', laboratory: 'Farma Sol', unitCost: 6100, supplierId: valle.id },
    { siigoCode: 'MED-011', barcode: '7700000000110', name: 'Diclofenaco gel 60 g', laboratory: 'Lab Aurora', unitCost: 7400, supplierId: andina.id },
    { siigoCode: 'MED-012', barcode: '7700000000127', name: 'Clotrimazol crema 20 g', laboratory: 'Genéricos Delta', unitCost: 4800, supplierId: pacifico.id },
  ]

  const created = []
  for (const product of products) {
    created.push(await db.product.create({ data: product }))
  }

  // [indice del producto, sede, numero de lote, dias para vencer, cantidad]
  const lots: [number, number, string, number, number][] = [
    [0, bodega.id, 'L24A118', 420, 240],
    [0, principal.id, 'L24A102', 25, 18],
    [0, sucursal.id, 'L23K907', -12, 6],
    [1, bodega.id, 'IB2290', 75, 120],
    [1, principal.id, 'IB2251', 300, 30],
    [2, sucursal.id, 'LR0193', 15, 12],
    [2, principal.id, 'LR0201', 210, 20],
    [3, bodega.id, 'AMX771', 55, 60],
    [3, sucursal.id, 'AMX702', -40, 4],
    [4, principal.id, 'OM5512', 160, 25],
    [4, sucursal.id, 'OM5498', 28, 10],
    [5, bodega.id, 'LS3301', 500, 300],
    [5, principal.id, 'LS3180', 85, 40],
    [6, sucursal.id, 'MF9921', 365, 35],
    [7, principal.id, 'SO1120', 9, 24],
    [7, bodega.id, 'SO1188', 130, 96],
    [8, sucursal.id, 'JT4410', 62, 14],
    [8, principal.id, 'JT4397', -3, 3],
    [9, bodega.id, 'VC7781', 240, 150],
    [10, principal.id, 'DG2205', 40, 8],
    [11, sucursal.id, 'CL6610', 190, 16],
    [11, bodega.id, 'CL6577', 20, 45],
  ]

  for (const [productIndex, branchId, lotNumber, days, quantity] of lots) {
    await db.lot.create({
      data: {
        productId: created[productIndex].id,
        branchId,
        lotNumber,
        expiresAt: daysFromToday(days),
        quantity,
        // cada lote arranca con su movimiento de entrada para que quede en el historial
        movements: {
          create: { type: 'ENTRY', quantity, note: 'Conteo inicial', userId: admin.id },
        },
      },
    })
  }

  console.log(`Listo: 3 sedes, 3 usuarios, ${created.length} productos y ${lots.length} lotes`)
  console.log('Usuarios (clave Demo1234): admin@demo.com, principal@demo.com, sucursal@demo.com')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
