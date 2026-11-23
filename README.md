# Food Store — Trabajo Práctico Integrador (Programación 4)

Aplicación web para un negocio de comidas: los clientes recorren el catálogo, arman un
carrito y confirman pedidos; el administrador gestiona categorías, productos, stock,
pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/Solrege/TPI-programacion4

## Funcionalidades

**Cliente**

- Registro e inicio de sesión (JWT en cookie HttpOnly).
- Catálogo paginado con búsqueda por nombre (sin distinguir mayúsculas ni tildes) y filtro
  por categoría.
- Carrito persistido en el navegador, con selector de cantidad limitado al stock.
- Checkout con dirección de entrega, forma de pago y notas.
- «Mis pedidos» con el detalle de cada pedido y cancelación mientras está en `PENDIENTE`.

**Administrador** (panel en `/admin`)

- Resumen con pedidos por estado, pedidos del día e ingresos.
- ABM de categorías y de productos, con cambio de stock y disponibilidad.
- Pedidos con filtro por estado; avanza o cancela según la máquina de estados
  (`PENDIENTE` → `EN_PREPARACION` → `ENTREGADO`, o `CANCELADO` desde los dos primeros).
- Usuarios: activar y desactivar.

Además: modo oscuro, y el stock se descuenta y se restituye en la misma transacción.

## Tecnologías

| Capa | Tecnologías |
|------|-------------|
| Backend | Python, FastAPI, SQLModel, PostgreSQL 16, JWT (python-jose), bcrypt |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query, Form y Table, Zustand, Axios, React Router |
| Infraestructura | Docker Compose (solo la base de datos) |

## Requisitos

| Herramienta | Versión |
|-------------|---------|
| Python | 3.11 a 3.13 |
| Node.js | 20.19 o superior (o 22.12 o superior) |
| pnpm | 9 o superior (`npm install -g pnpm`) |
| Docker con Docker Compose | Cualquiera reciente |

Puertos que se usan: `5434` (PostgreSQL), `8000` (API) y `5173` (frontend).

## Instalación y ejecución

Los comandos son para Linux y macOS. En Windows, ver las diferencias al final de esta
sección.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Solrege/TPI-programacion4.git
cd TPI-programacion4
```

### 2. Base de datos

```bash
docker compose up -d --wait
```

Levanta PostgreSQL 16 en el puerto `5434` del host. `--wait` espera a que la base esté
lista; sin él, el paso del seed puede fallar si Postgres todavía está arrancando.

### 3. Backend

En una terminal, desde la raíz del repositorio:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

- El seed crea las tablas, el usuario administrador, 7 categorías y 26 productos. Se puede
  correr más de una vez: no duplica datos.
- La API queda en http://localhost:8000. La documentación está en
  http://localhost:8000/docs (Swagger) y http://localhost:8000/redoc.

### 4. Frontend

En otra terminal, desde la raíz del repositorio:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build
pnpm dev
```

- `pnpm build` verifica los tipos y genera la versión de producción; no hace falta para
  usar `pnpm dev`.
- La aplicación queda en http://localhost:5173.

### En Windows

| Paso | Linux y macOS | Windows (PowerShell) |
|------|---------------|----------------------|
| Crear el entorno virtual | `python3 -m venv .venv` | `py -m venv .venv` |
| Activarlo | `source .venv/bin/activate` | `.venv\Scripts\Activate.ps1` |
| Copiar el `.env` | `cp .env.example .env` | `copy .env.example .env` |

## Usuarios de prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `Admin1234!` |

Lo crea el seed. Los clientes se registran desde la pantalla «Registrarse» (`/register`).

## Variables de entorno

Cada parte tiene su `.env.example`; alcanza con copiarlo como `.env`. Los `.env` no se
versionan.

### `backend/.env`

| Variable | Descripción | Valor de ejemplo |
|----------|-------------|------------------|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://foodstore:foodstore@localhost:5434/foodstore_db` |
| `SECRET_KEY` | Clave de firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie, en minutos | `30` |
| `FRONTEND_ORIGIN` | Origen del frontend permitido en CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | Cookie solo por HTTPS; `false` en desarrollo | `false` |

Para generar una `SECRET_KEY` propia:
`python -c "import secrets; print(secrets.token_hex(32))"`.

### `frontend/.env`

| Variable | Descripción | Valor de ejemplo |
|----------|-------------|------------------|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Estructura

```
.
├── backend/
│   ├── app/
│   │   ├── core/        Configuración, base de datos, seguridad, dependencias, Unit of Work
│   │   ├── db/          Registro de modelos y seed
│   │   └── modules/     auth, usuarios, categorias, productos y pedidos
│   │                    (router → service → unit of work → repository → models)
│   └── requests/        Peticiones de prueba para la extensión REST Client de VS Code
├── frontend/
│   └── src/
│       ├── features/    auth, categorias, productos, pedidos y usuarios
│       │                (pages, components, hooks, api y types)
│       ├── shared/      api (Axios, errores, TanStack Query), ui, components y layout
│       ├── store/       authStore, cartStore y themeStore (Zustand)
│       └── routes/      AppRouter y ProtectedRoute
├── docs/                Diagrama UML del modelo de datos
└── docker-compose.yml   PostgreSQL para desarrollo local
```
