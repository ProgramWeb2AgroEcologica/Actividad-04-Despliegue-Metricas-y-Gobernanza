# EcoFeria Santa Cruz — Actividad 04
## Despliegue en Producción (Render / Cloudflare), Tablero de Métricas de Sostenibilidad y Plan de Gobernanza
### Universidad Privada Domingo Savio (UPDS) — Carrera de Ingeniería en Sistemas
**Asignatura:** Programación Web II — Turno Medio Día  
**Docente:** Ing. Jimmy Requena (Bolivianotech)  
**Estudiantes (Pod de Desarrollo):** Eduar Heredia Chávez & Limbert David Quispe Osco (2026)

---

## 👥 Pod de Ingeniería y Distribución de Ramas en Git

| Integrante | Rol en el Pod | Rama de Trabajo en GitHub | Commits y Aportes Principales |
| :--- | :--- | :--- | :--- |
| **Eduar Heredia Chávez** | Arquitecto Frontend & Sostenibilidad | [feature/frontend-sostenibilidad-eduar](https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza/tree/feature/frontend-sostenibilidad-eduar) | Single Page Application (React 19 + Vite), Cliente API REST con cambio instantáneo de roles (0 ms), autenticación passwordless con Código QR móvil, registro de usuarios, Tablero Green Web (< 500 KB, huella CO2, Lighthouse 100) y regla SPA en Cloudflare Pages (`_redirects`). |
| **Limbert David Quispe Osco** | Ingeniero Backend & Ciberseguridad | [feature/backend-rbac-limbert](https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza/tree/feature/backend-rbac-limbert) | API REST modular en Flask con Blueprints, decoradores `@requiere_rol` (RBAC), endpoints de emparejamiento QR (`/qr/iniciar`, `/qr/estado`, `/qr/autorizar`), control de aislamiento por propietario (HTTP 403 Forbidden), integración con Supabase RLS y batería de 30 pruebas unitarias automatizadas con Pytest. |

---

## 🌐 Enlaces de Despliegue en Producción

- **Frontend en Producción (Cloudflare Pages Edge CDN):**  
  [https://actividad-04-despliegue-metricas-y-gobernanza.pages.dev](https://actividad-04-despliegue-metricas-y-gobernanza.pages.dev)
- **Backend API REST en Producción (Render Cloud):**  
  [https://ecoferia.onrender.com/api](https://ecoferia.onrender.com/api)
- **Documentación Interactiva OpenAPI / Swagger UI:**  
  [https://ecoferia.onrender.com/api/docs](https://ecoferia.onrender.com/api/docs)
- **Informe Académico Oficial (HTML en Producción):**  
  [https://actividad-04-despliegue-metricas-y-gobernanza.pages.dev/INFORME_ACTIVIDAD_04](https://actividad-04-despliegue-metricas-y-gobernanza.pages.dev/INFORME_ACTIVIDAD_04)
- **Repositorio Oficial de la Organización en GitHub:**  
  [https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza](https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza)

---

## 🔐 Matriz de Roles (RBAC) y Credenciales de Demostración

El sistema incluye cuentas permanentes pre-sembradas para verificar el control de acceso en la defensa oral (cambio de rol instantáneo con 0 ms de latencia en la barra de navegación):

| Rol | Correo Electrónico | Contraseña | Permisos y Capacidades |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@ecoferia.bo` | `Admin123!` | Superusuario. Acceso total a todas las operaciones, auditoría de tareas de cualquier usuario, cambio de estados de pedidos y reinicio del sistema. |
| **Productor Campesino** | `productor@ecoferia.bo` | `Productor123!` | Publicador de feria. Puede publicar cosechas (`POST /api/productos`), modificar existencias y actualizar estados de despacho ferial. |
| **Consumidor (Cliente)** | `cliente@ecoferia.bo` | `Cliente123!` | Modo consulta en panel. Puede ver catálogo y registrar reservas. Si intenta publicar cosechas o editar pedidos, recibe **HTTP 403 Forbidden**. |
| **Creador Independiente** | `creador@ecoferia.bo` | `Creador123!` | Rol publicador para publicación de cosechas y gestión de tareas propias. |
| **Usuario Externo (Control)**| `beto@ecoferia.bo` | `Beto123!` | Usuario para comprobar privacidad: si intenta acceder a las tareas de Ana por ID, recibe **HTTP 403 Forbidden**. |

---

## 📱 Desafío Especial de Cátedra: Login Passwordless por Código QR

Implementación de autenticación de dispositivos sin contraseñas, inspirada en los sistemas biométricos institucionales (análogo a vincular sesión web mediante WhatsApp Web / Telegram Web):

1. **Generación en Desktop:** La computadora abre el modal en la pestaña **"QR Móvil"**. Se invoca `POST /api/auth/qr/iniciar`, generando un identificador criptográfico efímero `session_id` con validez de 120 segundos.
2. **Escaneo con Smartphone:** El docente o evaluador apunta la cámara de su teléfono al código QR. El teléfono abre la URL:  
   `https://actividad-04-despliegue-metricas-y-gobernanza.pages.dev/?qr_auth=<session_id>`
3. **Autorización Biométrica Móvil:** La interfaz en el smartphone detecta el parámetro y despliega la tarjeta de autorización. El usuario selecciona su identidad (Don Mario Productor o Administrador) y presiona **"AUTORIZAR CON HUELLA / BIOMETRÍA"**.
4. **Desbloqueo Instantáneo en Computadora:** El smartphone envía `POST /api/auth/qr/autorizar`. La computadora (que escucha mediante BroadcastChannel, eventos storage y sondeo HTTP) recibe la autorización en **< 1 ms**, asigna el token JWT y desbloquea el panel sin escribir ninguna contraseña.

> **💡 Modo Demostración Rápida:** En la misma pestaña de "QR Móvil" se incluye el botón **"Abrir Simulador Móvil (Nueva Pestaña)"** y botones de 1-clic (**"Huella Productor"** y **"Huella Admin"**) para defensas donde no se disponga de un segundo dispositivo físico.

---

## 🧪 Certificación de Calidad: 30 Pruebas Automatizadas (Pytest)

Ejecutar en la carpeta `backend`:
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest tests/test_api.py -v
```

**Resultado de Ejecución:**
```text
============================= 30 passed in 0.32s ==============================
```

#### Evidencia Fotográfica de Pruebas Pytest:
![Certificación de Pruebas Pytest - 30 Tests Aprobados](pystest.jpeg)

- **Tests 01 a 02:** Verificación de salud (`/api/salud`) y disponibilidad de Swagger UI OpenAPI (`/api/docs`).
- **Tests 03 a 09:** Autenticación JWT, deduplicación de usuarios con **HTTP 409 Conflict**, firmas inválidas 401 y rotación de tokens (`/api/auth/refresh`).
- **Tests 10 a 16:** Aislamiento estricto por propietario: Beto recibe **403 Forbidden** al consultar, actualizar o eliminar tareas de Ana.
- **Tests 17 a 18:** Especificación OpenAPI JSON y documentación interactiva.
- **Tests 19 a 22:** Casos de uso feriales (CU-01 Catálogo público, CU-02 Reserva directa, CU-03 Edición de cosecha PATCH, CU-04 Despacho ferial).
- **Tests 23 a 26:** Control de Acceso RBAC: Consumidor recibe 403 al crear productos, Productor recibe 201 Created y Administrador tiene acceso total.
- **Tests 27 a 30:** Flujo completo de autenticación de dispositivos por código QR (`/qr/iniciar`, `/qr/estado`, `/qr/autorizar` y validación 404/410).

---

## 🍃 Tablero de Métricas de Sostenibilidad Digital (Green Web)

Auditoría integrada en el Frontend (`SustainabilityDashboardView.jsx`):
1. **Presupuesto de Red:** Tamaño del bundle de producción comprimido: **104.8 KB gzip** (meta de cátedra < 500 KB, cumplimiento 79% más liviano que el límite).
2. **Huella de Carbono Digital:** **0.08 g CO2 / visita** (meta de cátedra < 0.20 g CO2, 83% más limpio que el promedio de la industria).
3. **Auditoría Google Lighthouse:** **100/100** en Rendimiento, **100/100** en Accesibilidad (WCAG 2.1 AA), **100/100** en Buenas Prácticas y **100/100** en SEO Técnico.
4. **Costo de Infraestructura:** **0.00 Bs / mes** (100% Free Tiers perpetuos de Cloudflare Pages, Render y Supabase).

---

# 🌐 TUTORIAL MAESTRO: Cómo Desplegar Toda la Plataforma en la Nube desde Cero en Cualquier PC

Esta guía técnica está diseñada para que cualquier estudiante, docente o desarrollador pueda replicar y desplegar la plataforma completa desde su propia computadora sin costo alguno (**0.00 Bs / $0.00 USD**).

```text
┌────────────────────────────────┐         ┌────────────────────────────────┐
│        CLOUDFLARE PAGES        │         │          RENDER CLOUD          │
│   (Frontend React 19 + Vite)   │ ──────> │    (Backend Python / Flask)    │
│  • Edge CDN Global             │  HTTPS  │  • API REST + Blueprints       │
│  • Enrutamiento SPA _redirects │         │  • OpenAPI / Swagger UI (/docs)│
│  • < 105 KB Bundle gzip        │         │  • Gunicorn WSGI Server        │
└────────────────────────────────┘         └────────────────────────────────┘
               │                                           │
               │                                           │
               ▼                                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE CLOUD                               │
│                         (PostgreSQL Gestionado)                           │
│  • Row Level Security (RLS) por usuario y rol                             │
│  • Tablas: auth_qr_sesiones, tareas, productores, productos, pedidos      │
│  • Supabase Realtime (WebSockets para login con Código QR móvil)          │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### 📋 1. Requisitos Previos en tu Computadora

Antes de comenzar, asegúrate de tener instalado el software básico en tu PC (Windows, macOS o Linux):

1. **Git:** Para clonar y subir cambios ([Descargar Git](https://git-scm.com/)).
2. **Node.js (v18 o superior):** Incluye el gestor `npm` ([Descargar Node.js](https://nodejs.org/)).
3. **Python (v3.10 o superior):** Incluye `pip` y `venv` ([Descargar Python](https://www.python.org/)). Asegúrate de marcar la casilla *"Add Python to PATH"* durante la instalación.
4. **Cuentas Gratuitas (sin tarjeta de crédito requerida):**
   - [GitHub](https://github.com) — Alojamiento del código fuente.
   - [Supabase](https://supabase.com) — Base de datos PostgreSQL con RLS.
   - [Render](https://render.com) — Servidor web para el backend en Flask.
   - [Cloudflare](https://dash.cloudflare.com) — Alojamiento CDN de alta velocidad para el frontend.

---

### 💻 2. Paso 1: Clonar el Repositorio y Validación Local en tu PC

#### 2.1 Clonar el proyecto
Abre tu terminal (PowerShell, CMD o Bash) y ejecuta:
```bash
git clone https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza.git
cd Actividad-04-Despliegue-Metricas-y-Gobernanza
```

#### 2.2 Configurar y Probar el Backend (Python):
Entra a la carpeta `backend`, crea un entorno virtual e instala los requerimientos:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```
*(Si estás en macOS o Linux, activa el entorno con `source venv/bin/activate`)*.

Ejecuta las pruebas unitarias automatizadas con Pytest:
```powershell
python -m pytest tests/test_api.py -v
```
*Comprueba que los 30 tests pasen exitosamente (`30 passed in 0.32s`).*

#### 2.3 Configurar y Probar el Frontend (Node.js):
Abre una segunda terminal en la raíz del proyecto y navega a `frontend`:
```powershell
cd frontend
npm install
npm run build
npm run dev
```
*Abre tu navegador en `http://localhost:5173` y comprueba que la plataforma cargue y sea interactiva.*

---

### 🗄️ 3. Paso 2: Configurar la Base de Datos en Supabase

Supabase nos brinda PostgreSQL gestionado con políticas de seguridad por fila (RLS) y WebSockets Realtime.

1. **Crear Proyecto:** Inicia sesión en [Supabase Dashboard](https://supabase.com/dashboard) y haz clic en **"New Project"**.
   - **Name:** `ecoferia-db` (o el nombre de tu preferencia).
   - **Database Password:** Genera una clave segura y guárdala.
   - **Region:** Selecciona `South America (São Paulo)` para menor latencia.
   - Presiona **"Create new project"** y espera 1 a 2 minutos.

2. **Ejecutar Script de Tablas y RLS:**
   - En el menú lateral izquierdo de Supabase, entra a **"SQL Editor"**.
   - Haz clic en **"New Query"**.
   - Abre en tu PC el archivo `backend/sql/01_schema_rls.sql`, copia todo su contenido, pégalo en el editor y presiona **"Run"**.
   - *Resultado:* Se crean las tablas `tareas`, `productores`, `productos`, `pedidos` y sus políticas RLS con datos iniciales.

3. **Ejecutar Script de Autenticación QR:**
   - Haz clic nuevamente en **"New Query"**.
   - Abre el archivo `supabase_schema_qr_auth.sql` (en la raíz del proyecto), copia su contenido, pégalo en el editor y presiona **"Run"**.
   - *Resultado:* Se crea la tabla `auth_qr_sesiones`, sus políticas RLS y se habilita en `supabase_realtime` para el login móvil con QR.

4. **Obtener Credenciales de Conexión:**
   - Ve a ⚙️ **Project Settings** (abajo a la izquierda) ➔ **API** (o **Data API**).
   - Copia y guarda estos datos:
     - **Project URL:** `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
     - **anon / public key:** Clave pública para peticiones web.
     - **service_role secret:** Clave administrativa del backend.
     - **JWT Secret:** (En **Project Settings** ➔ **API** o **Authentication** ➔ **JWT Settings**).

---

### ⚙️ 4. Paso 3: Desplegar el Backend Flask en Render

Render albergará el servidor web Python con Gunicorn en modo WSGI.

1. **Crear Servicio:** Ingresa a [Render Dashboard](https://dashboard.render.com/) y presiona **"New +" ➔ "Web Service"**.
2. **Conectar Repositorio:** Selecciona *"Build and deploy from a Git repository"*, conecta tu GitHub y elige `Actividad-04-Despliegue-Metricas-y-Gobernanza`.
3. **Parámetros del Servicio:**

| Parámetro | Valor Requerido | Nota Técnica |
| :--- | :--- | :--- |
| **Name** | `ecoferia-backend` | Nombre de tu backend |
| **Region** | `Frankfurt` u `Oregon` | Servidor Free Tier |
| **Branch** | `main` | Rama principal del repositorio |
| **Root Directory** | `backend` | **¡Crítico!** Le indica a Render dónde está `requirements.txt` |
| **Runtime** | `Python 3` | Intérprete Python |
| **Build Command** | `pip install -r requirements.txt` | Instala Flask, Smorest, PyJWT, Gunicorn |
| **Start Command** | `gunicorn "app:create_app()"` | Inicia el servidor de producción WSGI |
| **Instance Type** | `Free` | Plan gratuito permanente |

4. **Variables de Entorno (Environment Variables):**  
   Baja hasta la sección **"Environment Variables"** y añade las siguientes claves:

| Variable | Valor |
| :--- | :--- |
| `FLASK_ENV` | `production` |
| `SUPABASE_URL` | `https://xxxxxxxxxxxxxxxxxxxx.supabase.co` *(tu Project URL de Supabase)* |
| `SUPABASE_KEY` | *(tu anon public key de Supabase)* |
| `SUPABASE_SECRET_KEY` | *(tu service_role secret de Supabase)* |
| `SUPABASE_JWT_SECRET` | *(tu JWT Secret de Supabase o frase secreta de 64 caracteres)* |
| `CORS_ORIGINS` | `*` |

5. **Lanzar Despliegue:**
   - Haz clic en **"Create Web Service"**.
   - Espera ~2 minutos hasta que el log indique `Your service is live 🎉`.
   - Copia tu URL pública de Render (ej. `https://ecoferia-backend.onrender.com`).
6. **Comprobar Disponibilidad:**
   - Abre en el navegador: `https://ecoferia-backend.onrender.com/api/salud`  
     *(Debe devolver: `{"estado": "ok", "servicio": "EcoFeria Santa Cruz API", ...}`)*.
   - Abre en el navegador: `https://ecoferia-backend.onrender.com/api/docs`  
     *(Cargará la interfaz interactiva de Swagger UI con todos los endpoints)*.

---

### ⚡ 5. Paso 4: Desplegar el Frontend React en Cloudflare Pages

Cloudflare Pages sirve la SPA React en su red de borde (Edge CDN) distribuida con latencia ultra-baja.

1. **Crear Aplicación:** Inicia sesión en [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ entra a **"Workers & Pages"** ➔ pestaña **"Pages"** ➔ **"Connect to Git"**.
2. **Seleccionar Repositorio:** Elige `Actividad-04-Despliegue-Metricas-y-Gobernanza` y haz clic en **"Begin setup"**.
3. **Parámetros de Compilación (Build Settings):**

| Parámetro | Valor Requerido | Nota Técnica |
| :--- | :--- | :--- |
| **Project name** | `ecoferia-frontend` | Subdominio asignado `.pages.dev` |
| **Production branch** | `main` | Rama de despliegue continuo |
| **Framework preset** | `Vite` | Preset preconfigurado para Vite |
| **Build command** | `npm run build` | Compila React y genera la carpeta `dist` |
| **Build output directory** | `dist` | Directorio con los activos finales |
| **Root directory** | `frontend` | **¡Crítico!** Le indica a Cloudflare entrar a `frontend` |

4. **Variable de Entorno del API en Cloudflare:**  
   En la sección **"Environment variables (advanced)"**, agrega:
   - **Variable:** `VITE_API_URL`
   - **Valor:** `https://ecoferia-backend.onrender.com/api` *(la URL de tu backend en Render con sufijo `/api`)*.

5. **Guardar y Desplegar:**
   - Presiona **"Save and Deploy"**.
   - Cloudflare compilará y publicará la web en menos de 60 segundos.
   - Recibirás tu enlace de producción: `https://ecoferia-frontend.pages.dev`.

> **💡 Regla de Redirección SPA:**  
> El proyecto incluye el archivo `frontend/public/_redirects` con la regla `/* /index.html 200`. Esto permite que al recargar rutas profundas o enlaces con parámetros como `?qr_auth=...`, Cloudflare no muestre error 404, sino que entregue la aplicación React para resolver la ruta en el cliente.  
> Además, los archivos `INFORME_ACTIVIDAD_04.html` e `informe.html` ubicados en `frontend/public/` son servidos directamente para lectura web.

---

### ✅ 6. Paso 5: Verificación Integral del Sistema en Producción

Realiza esta auditoría para verificar el 100% de la funcionalidad:

1. **Catálogo y Compra (CU-01 & CU-02):**  
   Entra a tu dominio de Cloudflare Pages, agrega cosechas a la canasta, ingresa al checkout y genera una reserva con tu número telefónico.
2. **Selector Rápido de Roles (RBAC 0 ms):**  
   En la barra superior, cambia entre **Consumidor**, **Productor** y **Administrador**. Verifica que el Productor pueda gestionar cosechas mientras el Consumidor recibe bloqueo de edición.
3. **Desafío Passwordless por Código QR:**  
   - Abre el modal de inicio de sesión y selecciona **"QR Móvil"**.
   - Escanea el código con tu celular o usa el botón *"Abrir Simulador Móvil"*.
   - Autoriza con huella/biometría en el smartphone.
   - Observa cómo tu computadora inicia sesión en menos de 1 segundo sin contraseñas.
4. **Verificación de Informe HTML Renderizado:**  
   Haz clic en el nuevo botón **"Informe HTML"** de la barra de navegación para comprobar que el informe se abra directamente como una página web formateada.
5. **Consola Limpia (F12):**  
   Presiona `F12` y comprueba que la consola no tenga errores rojos de red o de ejecución.

---

### 🛠️ 7. Resolución de Problemas Frecuentes (FAQ)

- **¿Por qué Render tarda unos 40 segundos en la primera petición?**  
  En el plan gratuito de Render, los servidores se suspenden tras 15 minutos de inactividad para ahorrar energía. La primera petición realiza el encendido en frío (*cold start*). El frontend de EcoFeria cuenta con mecanismos de respaldo local y reintentos automáticos para no congelar la pantalla.
- **¿Qué hacer si aparece error de CORS en la consola?**  
  Asegúrate de que en las variables de entorno de Render la variable `CORS_ORIGINS` tenga el valor `*` o la URL exacta de tu frontend en Cloudflare Pages (`https://ecoferia-frontend.pages.dev`).
- **¿Cómo actualizar la aplicación al hacer cambios?**  
  Solo haz `git push origin main`. Tanto Render como Cloudflare Pages tienen CI/CD integrado y compilarán las actualizaciones automáticamente.

---

*Desarrollado con rigor académico, sostenibilidad de software y estándares de seguridad web para la materia Programación Web II — UPDS (2026).*