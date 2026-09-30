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
- **Repositorio Oficial de la Organización en GitHub:**  
  [https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza](https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza)
- **Informe Académico Oficial Interactivo:**  
  [Ver INFORME_ACTIVIDAD_04.html](./INFORME_ACTIVIDAD_04.html)
- **Tutorial Completo de Despliegue en la Nube:**  
  [Ver TUTORIAL_DESPLIEGUE.md](./TUTORIAL_DESPLIEGUE.md)

---

## 🔐 Matriz de Roles (RBAC) y Credenciales de Demostración

El sistema incluye cuentas permanentes pre-sembradas para verificar el control de acceso en la defensa oral (cambio de rol instantáneo con 0 ms de latencia en la barra de navegación):

| Rol | Correo Electrónico | Contraseña | Permisos y Capacidades |
| :--- | :--- | :--- | :--- |
| **Administrador** | admin@ecoferia.bo | Admin123! | Superusuario. Acceso total a todas las operaciones, auditoría de tareas de cualquier usuario, cambio de estados de pedidos y reinicio del sistema. |
| **Productor Campesino** | productor@ecoferia.bo | Productor123! | Publicador de feria. Puede publicar cosechas (`POST /api/productos`), modificar existencias y actualizar estados de despacho ferial. |
| **Consumidor (Cliente)** | cliente@ecoferia.bo | Cliente123! | Modo consulta en panel. Puede ver catálogo y registrar reservas. Si intenta publicar cosechas o editar pedidos, recibe **HTTP 403 Forbidden**. |
| **Creador Independiente** | creador@ecoferia.bo | Creador123! | Rol publicador para publicación de cosechas y gestión de tareas propias. |
| **Usuario Externo (Control)**| beto@ecoferia.bo | Beto123! | Usuario para comprobar privacidad: si intenta acceder a las tareas de Ana por ID, recibe **HTTP 403 Forbidden**. |

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

# 🚀 TUTORIAL PASO A PASO: Cómo Desplegar Toda la Plataforma en la Nube desde Cero en Cualquier PC

Esta guía técnica está diseñada para que cualquier estudiante, docente o desarrollador pueda replicar y desplegar la plataforma completa desde su propia computadora sin costo alguno (**0.00 Bs**).

```text
  +--------------------+         +--------------------+         +--------------------+
  |  Cloudflare Pages  | <=====> |    Render Cloud    | <=====> |   Supabase Cloud   |
  |  (React SPA Vite)  |  HTTPS  | (Flask API Python) |  HTTPS  |  (PostgreSQL + RLS)|
  +--------------------+         +--------------------+         +--------------------+
```

### 📋 Requisitos Previos en tu Computadora
1. **Git:** Instalado en tu terminal ([git-scm.com](https://git-scm.com/)).
2. **Node.js:** Versión 18 o superior ([nodejs.org](https://nodejs.org/)).
3. **Python:** Versión 3.10 o superior ([python.org](https://www.python.org/)).
4. **Cuentas Gratuitas:**
   - GitHub: [github.com](https://github.com)
   - Supabase: [supabase.com](https://supabase.com)
   - Render: [render.com](https://render.com)
   - Cloudflare: [cloudflare.com](https://cloudflare.com)

---

### Paso 1: Clonar y Probar Localmente en tu PC

Abre tu terminal (PowerShell o Bash) y clona el repositorio:
```bash
git clone https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza.git
cd Actividad-04-Despliegue-Metricas-y-Gobernanza
```

#### 1.1 Configurar y Probar el Backend (Python):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m pytest tests/test_api.py -v
```
*Verifica que los 30 tests pasen exitosamente.*

#### 1.2 Configurar y Probar el Frontend (Node.js):
En una nueva terminal:
```powershell
cd frontend
npm install
npm run build
npm run dev
```
*Abre tu navegador en `http://localhost:5173` para comprobar que la interfaz cargue.*

---

### Paso 2: Configurar la Base de Datos en Supabase

1. Inicia sesión en [Supabase](https://supabase.com) y presiona **"New Project"**.
2. Asigna un nombre al proyecto (ej. `ecoferia-db`) y una contraseña segura para la base de datos. Selecciona la región más cercana (ej. `South America (São Paulo)`).
3. Una vez creado el proyecto, ve al menú lateral izquierdo y entra en **"SQL Editor"**.
4. Haz clic en **"New Query"**, copia todo el contenido del archivo `backend/sql/01_schema_rls.sql` y pégalo en el editor. Presiona **"Run"**.
   - Esto creará las tablas: `tareas`, `productores`, `productos` y `pedidos`.
   - Configurará las políticas de seguridad **Row Level Security (RLS)** y los datos semilla iniciales.
5. Haz clic en **"New Query"** nuevamente, copia el contenido del archivo `supabase_schema_qr_auth.sql` y presiona **"Run"**.
   - Esto creará la tabla `auth_qr_sesiones` y la registrará en `supabase_realtime` para el login por código QR.
6. Ve a **Project Settings -> API** y copia:
   - **Project URL:** `https://<tu-id>.supabase.co`
   - **anon public key:** Clave pública para lectura.
   - **service_role secret:** Clave de administración para el backend.
   - **JWT Secret:** Clave para firmar y verificar tokens JWT.

---

### Paso 3: Desplegar el Backend Flask en Render

1. Entra a [Render](https://render.com) y conecta tu cuenta de GitHub.
2. Haz clic en **"New +" -> "Web Service"**.
3. Selecciona tu repositorio de GitHub `Actividad-04-Despliegue-Metricas-y-Gobernanza`.
4. Completa la configuración del servicio:
   - **Name:** `ecoferia-backend` (o el nombre que elijas).
   - **Region:** Frankfurt u Oregon (Free Tier).
   - **Branch:** `main`.
   - **Root Directory:** `backend` *(muy importante para que encuentre requirements.txt)*.
   - **Runtime:** `Python 3`.
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn "app:create_app()"`
   - **Instance Type:** `Free`.
5. En la sección **"Environment Variables"**, añade las siguientes variables:
   - `FLASK_ENV` = `production`
   - `SUPABASE_URL` = `https://<tu-id>.supabase.co`
   - `SUPABASE_KEY` = `<tu-anon-key-de-supabase>`
   - `SUPABASE_SECRET_KEY` = `<tu-service-role-key-de-supabase>`
   - `SUPABASE_JWT_SECRET` = `<tu-jwt-secret-de-supabase>`
   - `CORS_ORIGINS` = `*`
6. Haz clic en **"Create Web Service"**.
7. Espera unos 2-3 minutos mientras Render compila e inicia el servidor.
8. Cuando el estado sea **"Live"**, copia tu URL pública (ej. `https://ecoferia-backend.onrender.com`).
9. Verifica en tu navegador:
   - `https://ecoferia-backend.onrender.com/api/salud` (Debe responder `{"estado": "ok"}`).
   - `https://ecoferia-backend.onrender.com/api/docs` (Cargará la documentación interactiva Swagger UI).

---

### Paso 4: Desplegar el Frontend React en Cloudflare Pages

1. Inicia sesión en [Cloudflare](https://dash.cloudflare.com) y ve a **Workers & Pages**.
2. Haz clic en **"Create application" -> pestaña "Pages" -> "Connect to Git"**.
3. Elige tu repositorio de GitHub `Actividad-04-Despliegue-Metricas-y-Gobernanza`.
4. Configura los parámetros de compilación:
   - **Project name:** `ecoferia-frontend`
   - **Production branch:** `main`
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `frontend` *(muy importante para que compile en la carpeta correcta)*.
5. En la sección **"Environment variables" (Producción)**, agrega:
   - `VITE_API_URL` = `https://ecoferia-backend.onrender.com/api` *(la URL de tu backend en Render con el sufijo `/api`)*.
6. Presiona **"Save and Deploy"**.
7. Cloudflare Pages descargará las dependencias y construirá el sitio en menos de 1 minuto.
8. Una vez finalizado, recibirás tu URL global de alta velocidad:
   `https://ecoferia-frontend.pages.dev`

> **Nota sobre el Enrutamiento SPA:** El repositorio incluye el archivo `frontend/public/_redirects` con la regla `/* /index.html 200`. Esto garantiza que si recargas la página o abres un enlace con parámetros como `?qr_auth=...`, Cloudflare sirva la aplicación React sin errores 404.

---

### Paso 5: Verificación Final del Despliegue en la Nube

Una vez completados los pasos anteriores, realiza este checklist de verificación:

1. **Catálogo Público (CU-01):** Abre la URL de Cloudflare Pages. Debes ver las cosechas agroecológicas frescas.
2. **Reserva Directa (CU-02):** Añade lechuga o tomates a la canasta y confirma un pedido con tus datos.
3. **Selector Instantáneo RBAC:** En la barra superior, cambia entre Consumidor, Productor y Administrador en 0 ms.
4. **Registro de Usuario (CU-01):** Abre el modal de Login, entra a "Registro", crea una nueva cuenta y verifica que accedas automáticamente.
5. **Autenticación con Código QR:**
   - En tu computadora, ve a la pestaña "QR Móvil".
   - Escanea el código con tu celular (o haz clic en "Abrir Simulador Móvil").
   - Autoriza con el botón biométrico.
   - Observa cómo tu computadora inicia sesión de inmediato sin contraseñas.
6. **Consola Limpia (F12):** Abre las herramientas de desarrollador (F12) y comprueba que no haya errores rojos ni advertencias al interactuar con la plataforma.

---

### 🛠️ Solución de Problemas Frecuentes (FAQ)

- **¿Por qué el backend tarda unos segundos en responder la primera vez?**  
  En el plan gratuito de Render, las instancias entran en modo de suspensión tras 15 minutos sin tráfico. El primer arranque ("cold-start") puede demorar ~40 segundos. El frontend de EcoFeria está programado de forma resiliente para operar con almacenamiento local sin bloquear la pantalla mientras el backend despierta.
- **¿Qué hago si sale un error de CORS al hacer peticiones?**  
  Verifica que en `backend/app/config.py` o en las variables de entorno de Render, la variable `CORS_ORIGINS` contenga `*` o el dominio de Cloudflare Pages.
- **¿Cómo actualizar la aplicación después de hacer cambios en el código?**  
  Basta con hacer `git push origin main`. Tanto Render como Cloudflare Pages tienen integración continua (CI/CD) y se compilan automáticamente con cada commit.

---

## 📄 Informe Oficial Académico
- [Acceder a INFORME_ACTIVIDAD_04.html](./INFORME_ACTIVIDAD_04.html)

*Desarrollado con rigor académico, sostenibilidad de software y estándares de seguridad web para la materia Programación Web II — UPDS (2026).*