# Control de vencimientos

> 🚧 **En construcción.** Ver el [plan de trabajo](docs/PLAN.md) para saber qué está hecho y qué falta.

App web para controlar los **lotes y fechas de vencimiento** de los medicamentos en una distribuidora farmacéutica y sus dos farmacias.

## El problema

La empresa factura con Siigo, pero Siigo no maneja lotes ni fechas de vencimiento. No hay forma de saber qué productos están por vencer hasta que alguien los encuentra en la estantería, y muchas veces para ese momento ya pasó el plazo para devolverlos al proveedor. Eso es plata perdida.

## La solución

- Registrar el lote y el vencimiento de cada producto en cada sede (escaneando el código de barras desde el celular)
- Ver un semáforo con lo que está vencido, lo que vence en 30 días y lo que vence en 90 días
- Decidir qué hacer con cada lote antes de perderlo: trasladarlo a otra sede, devolverlo al proveedor, ponerlo en promoción o darlo de baja
- Recibir un resumen semanal con lo que está por vencer
- Ver cuánta plata se pierde por vencimientos y cuánta se recupera

Hay dos tipos de usuario: el **administrador** ve las tres sedes y el **encargado** de cada farmacia solo ve la suya.

## Tecnologías

- **Next.js 16** (App Router, Server Actions) + **TypeScript**
- **PostgreSQL** + **Prisma 7**
- **Tailwind CSS**
- Sesiones con **jose** (JWT en cookie httpOnly) y contraseñas con **bcrypt**
- Validación con **zod**
- Docker para la base de datos en desarrollo

## Cómo correrlo

Necesitas Node 20+ y Docker.

```bash
npm install
cp .env.example .env          # y cambia SESSION_SECRET
docker compose up -d          # levanta postgres en el puerto 5434
npm run db:migrate            # crea las tablas
npm run db:seed               # carga datos de prueba
npm run dev
```

Abre http://localhost:3000

### Usuarios de prueba

Todos con la contraseña `Demo1234`:

| Correo | Rol |
|---|---|
| admin@demo.com | Administrador (ve las 3 sedes) |
| principal@demo.com | Encargada de la farmacia principal |
| sucursal@demo.com | Encargado de la farmacia sucursal |

Los productos, laboratorios y proveedores de los datos de prueba son ficticios.

## Estructura

```
prisma/
  schema.prisma       # tablas: sedes, usuarios, proveedores, productos, lotes, movimientos
  seed.ts             # datos de prueba
src/
  proxy.ts            # redirige al login si no hay sesion
  lib/
    db.ts             # cliente de prisma
    session.ts        # crear, leer y borrar la sesion
    dal.ts            # usuario actual y permisos por rol
  app/
    login/            # pagina y server actions de login
    (panel)/          # paginas que necesitan sesion
docs/
  PLAN.md             # plan de trabajo por dias
```

## Decisiones

- **El lote es por sede.** El mismo lote de un producto puede estar en la bodega y en una farmacia con cantidades distintas, por eso la clave única es `producto + sede + número de lote`.
- **Todo cambio queda en el historial.** La cantidad de un lote nunca se edita directamente: cada entrada, traslado, devolución o baja crea un `LotMovement`.
- **La seguridad no depende solo del proxy.** El `proxy.ts` hace un chequeo rápido de la cookie, pero cada página vuelve a validar el usuario en `lib/dal.ts` contra la base de datos (si desactivan a un usuario pierde acceso aunque tenga la cookie).
