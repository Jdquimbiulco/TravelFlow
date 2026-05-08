# ✈️ TravelFlow - Sistema de Gestión de Viajes

Un sistema backend robusto construido con **Node.js, Express.js y Prisma ORM**, diseñado bajo la arquitectura **MVC (Modelo-Vista-Controlador)**. Este proyecto permite gestionar usuarios, destinos turísticos, reservas y pagos utilizando una base de datos **PostgreSQL** alojada en Supabase.

Adicionalmente, el proyecto incorpora herramientas de calidad de software (**SonarQube**, **ESLint**) y pruebas automatizadas (**Jest**) para asegurar los procesos de verificación y validación (V&V).

---

## 🏗️ Arquitectura del Proyecto (MVC Modular)

El código está organizado por dominios de negocio para facilitar el trabajo en paralelo de múltiples desarrolladores:

```text
TravelFlow/
├── src/
│   ├── app.js                    # Configuración inicial de Express
│   ├── server.js                 # Punto de arranque del servidor
│   ├── config/db.js              # Adaptador y conexión de Prisma a Postgres
│   ├── controllers/              # Reciben las peticiones HTTP y envían respuestas JSON
│   ├── routes/                   # Definen los endpoints de la API (/api/users, etc.)
│   ├── services/                 # Lógica de negocio y consultas a Prisma (El "Modelo")
│   └── middlewares/              # Validaciones y manejo global de errores
├── prisma/
│   ├── schema.prisma             # Modelado de Base de Datos
│   └── prisma.config.ts          # Configuración para Prisma v7
├── tests/                        # Pruebas automatizadas con Jest
└── sonar-project.properties      # Reglas para análisis estático en SonarQube
```

---

## 🚀 Guía de Instalación y Ejecución

Sigue estos pasos cuidadosamente para levantar el proyecto en tu computadora local.

### 1. Pre-requisitos
* Tener instalado **Node.js** (v18 o superior).
* Tener una cuenta en **Supabase** (para alojar la base de datos PostgreSQL) o tener PostgreSQL instalado localmente.

### 2. Instalación de dependencias
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
npm install
```

### 3. Configuración de Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que el `package.json`). Debes agregar las URLs de conexión a tu base de datos de Supabase.

```env
# Ejemplo de configuración para Supabase (Reemplazar con tus credenciales)
DATABASE_URL="postgresql://postgres.xxx:TU_CONTRASENA@aws-0-pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.xxx:TU_CONTRASENA@aws-0-pooler.supabase.com:5432/postgres"

PORT=3000
NODE_ENV="development"
```

### 4. Generar Cliente y Sincronizar Base de Datos
Debes ejecutar estos comandos para que Prisma cree las tablas en Supabase y genere el código interno de conexión:

```bash
npx prisma generate
npx prisma db push
```
*(Si sale un mensaje verde diciendo que todo está en sincronía, la base de datos está lista).*

### 5. Iniciar el Servidor Local
Para arrancar el servidor en modo desarrollo (se reiniciará automáticamente si haces cambios en el código):
```bash
npm run dev
```
La consola debería mostrar el mensaje: **`Server is running on port 3000`**.

---

## 🗄️ Estructura de la Base de Datos

La base de datos cuenta con 4 entidades principales:
* **User (Usuario):** Clientes de la agencia.
* **Destination (Destino):** Catálogo de viajes y lugares disponibles.
* **Reservation (Reserva):** Tabla puente que vincula a un Usuario con un Destino por una cantidad de días.
* **Payment (Pago):** Registro financiero ligado a una reserva en específico.

**Relaciones:**
* Usuario `1 : N` Reservas
* Destino `1 : N` Reservas
* Reserva `1 : 1` Pago

---

## 🛠️ Comandos de Calidad (V&V)

Para cumplir con las normas de Validación y Verificación, antes de hacer "Commit" deben ejecutar los siguientes comandos:

* **Correr pruebas automatizadas:**
  ```bash
  npm run test
  ```
* **Revisar estilo de código (Linter):**
  ```bash
  npm run lint
  ```
* **SonarQube:** (Requiere tener el escáner de SonarQube instalado en la máquina)
  ```bash
  sonar-scanner
  ```