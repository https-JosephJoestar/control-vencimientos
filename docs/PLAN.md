# Plan de trabajo

Plan de 2 semanas. Cada día tiene una meta pequeña que se puede terminar y commitear.
Marca con `[x]` lo que vayas terminando.

## El problema

La distribuidora y las dos farmacias facturan con Siigo, pero Siigo no maneja lotes ni fechas de vencimiento.
No hay forma de saber qué productos están próximos a vencer hasta que alguien los encuentra en la estantería, y para ese momento muchas veces ya no se pueden devolver al proveedor.

## La solución

Una app web (que funcione bien en el celular) donde:

1. Se registra el lote y la fecha de vencimiento de cada producto en cada sede
2. Se ve un semáforo de qué se vence pronto
3. Se decide qué hacer con cada lote antes de que se pierda (trasladar, devolver, promoción, baja)
4. Llega una alerta semanal con lo que se vence

---

## Semana 1

### Día 1–2 · Base del proyecto ✅
- [x] Next.js + TypeScript + Tailwind
- [x] PostgreSQL con Docker y Prisma
- [x] Esquema: sedes, usuarios, proveedores, productos, lotes, movimientos
- [x] Datos de prueba (`prisma/seed.ts`)
- [x] Login con sesión en cookie (jose) y roles admin / encargado
- [x] `proxy.ts` que manda al login si no hay sesión
- [x] `lib/dal.ts` con `getCurrentUser`, `requireAdmin` y `branchFilter`

### Día 3–4 · Lotes
- [ ] Página `/lotes` con una tabla: producto, lote, sede, vencimiento, cantidad
  - Usar `branchFilter()` en el `where` para que el encargado solo vea su sede
  - Ordenar por `expiresAt` ascendente (lo que se vence primero arriba)
- [ ] Página `/lotes/nuevo` con un formulario: buscar producto, lote, fecha, cantidad, sede
  - El encargado no elige sede, se usa la suya
  - Validar con zod: cantidad > 0, fecha válida
  - Al crear el lote crear también un `LotMovement` de tipo `ENTRY` (usar `db.$transaction`)
  - Si el lote ya existe en esa sede (error `P2002` de prisma) sumar la cantidad en vez de fallar
- [ ] Link "Lotes" en el menú de `(panel)/layout.tsx`

> Pista: las Server Actions con `useActionState` funcionan igual que en `login/actions.ts`.

### Día 5–6 · Importar productos de Siigo y escanear códigos
- [ ] Página `/importar` (solo admin, usar `requireAdmin()`)
  - Subir el Excel de productos exportado de Siigo
  - Leerlo con la librería `xlsx` (SheetJS)
  - Mostrar una vista previa y las filas con errores antes de guardar
  - Crear o actualizar por `siigoCode` con `db.product.upsert`
- [ ] En `/lotes/nuevo` agregar un botón para escanear el código de barras con la cámara
  - Mirar la API `BarcodeDetector` del navegador (Chrome en Android la tiene)
  - Si no está disponible dejar escribir el código a mano

### Día 7 · Semáforo
- [ ] Función `expiryStatus(expiresAt, today)` en `src/lib/expiry.ts` que devuelva:
  - `expired` si ya venció
  - `critical` si faltan 30 días o menos
  - `warning` si faltan 90 días o menos
  - `ok` en otro caso
- [ ] Tests de esa función con Vitest (es la regla más importante de la app, tiene que estar probada)
  - Casos borde: vence hoy, vence en exactamente 30 días, 31 días

### Día 8 · Panel de inicio
- [ ] En la página de inicio mostrar tarjetas con cuántos lotes hay en cada color y cuánta plata representan (`quantity * product.unitCost`)
- [ ] Filtros en `/lotes` por estado, sede y proveedor (usar `searchParams` de la URL para que los filtros se puedan compartir)
- [ ] Colores del semáforo en la tabla de lotes

## Semana 2

### Día 9–10 · Acciones sobre un lote
- [ ] Página `/lotes/[id]` con el detalle del lote y su historial de movimientos
- [ ] Botones de acción:
  - **Trasladar** a otra sede: resta en este lote y suma (o crea) el mismo lote en la otra sede. Dos movimientos `TRANSFER_OUT` y `TRANSFER_IN` dentro de una transacción
  - **Devolver al proveedor** (`RETURN`): mostrar hasta qué fecha acepta devoluciones según `supplier.returnWindowMonths`
  - **Promoción** (`PROMOTION`): solo deja registro, no cambia la cantidad
  - **Dar de baja** (`WRITE_OFF`)
  - **Reconteo** (`COUNT_ADJUST`): poner la cantidad real y guardar la diferencia
- [ ] No dejar que la cantidad quede negativa

### Día 11 · Alerta semanal
- [ ] Ruta `/api/cron/weekly-alert` que arme el resumen de lo que se vence en los próximos 30 días
- [ ] Enviarlo por correo (Resend tiene plan gratis) o por Telegram (más fácil, solo un bot y un `fetch`)
- [ ] Protegerla con un header secreto para que nadie más la pueda llamar
- [ ] Programarla con Vercel Cron todos los lunes a las 7 a.m.

### Día 12 · Reporte
- [ ] Página `/reportes` (solo admin):
  - Plata perdida por bajas (`WRITE_OFF`) del mes
  - Plata recuperada con traslados y devoluciones
  - Top 10 productos que más se vencen

### Día 13–14 · Cierre
- [ ] Revisar todo en el celular
- [ ] Gestión de usuarios para el admin (crear encargados, desactivar)
- [ ] Desplegar: base de datos en Supabase o Neon, app en Vercel
- [ ] README con capturas, link a la demo y usuarios de prueba
- [ ] Grabar un GIF corto del flujo: escanear → registrar lote → verlo en rojo → trasladarlo

---

## Para después (si sobra tiempo)

- Exportar el reporte a Excel
- Modo sin internet para el conteo inicial
- Cruzar con el inventario de Siigo para detectar diferencias
