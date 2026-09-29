# EcoFeria Santa Cruz ? Actividad 04
## Despliegue en Producci?n (Render / Cloudflare), Tablero de M?tricas de Sostenibilidad y Plan de Gobernanza
### Universidad Privada Domingo Savio (UPDS) ? Carrera de Ingenier?a en Sistemas
**Asignatura:** Programaci?n Web II ? Turno Medio D?a  
**Docente:** Ing. Jimmy Requena (Bolivianotech)

---

### ?? Pod de Ingenier?a y Distribuci?n de Ramas en Git

| Integrante | Rol en el Pod | Rama de Trabajo en GitHub | Commits y Aportes Principales |
| :--- | :--- | :--- | :--- |
| **Eduar Heredia Ch?vez** | Arquitecto Frontend & Sostenibilidad | [`feature/frontend-sostenibilidad-eduar`](https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza/tree/feature/frontend-sostenibilidad-eduar) | Single Page Application (React 19 + Vite), Cliente API REST con selector de roles en vivo, Tablero de Sostenibilidad Digital (< 500 KB, huella CO?, Lighthouse 100) y configuraci?n de routing SPA en Cloudflare Pages (`_redirects`). |
| **Limbert David Quispe Osco** | Ingeniero Backend & Ciberseguridad | [`feature/backend-rbac-limbert`](https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza/tree/feature/backend-rbac-limbert) | API REST modular en Flask con Blueprints, decoradores `@requiere_rol` (RBAC), control de privacidad por propietario (HTTP 403 Forbidden en recursos ajenos), integraci?n con Supabase RLS y bater?a de 28 pruebas unitarias automatizadas con Pytest. |

---

### ?? Enlaces de Despliegue en Producci?n

- **Frontend en Producci?n (Cloudflare Pages Edge CDN):** `https://ecoferia.pages.dev`
- **Backend API REST en Producci?n (Render Cloud):** `https://ecoferia.onrender.com`
- **Documentaci?n Interactiva OpenAPI / Swagger UI:** `https://ecoferia.onrender.com/api/docs`
- **Repositorio Oficial de la Organizaci?n:** `https://github.com/ProgramWeb2AgroEcologica/Actividad-04-Despliegue-Metricas-y-Gobernanza`

---

### ??? Matriz de Roles (RBAC) y Credenciales de Demostraci?n en Vivo

El sistema incluye cuentas permanentes pre-sembradas para verificar el control de acceso en la defensa oral:

| Rol | Correo Electr?nico | Contrase?a | Permisos y Capacidades |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@ecoferia.bo` | `Admin123!` | Superusuario. Acceso total a todas las operaciones, auditor?a de tareas de cualquier usuario, cambio de estados de pedidos y reinicio del sistema. |
| **Productor / Publicador** | `productor@ecoferia.bo` | `Productor123!` | Publicador de feria. Puede publicar cosechas (`POST /api/productos`), modificar existencias y actualizar estados de despacho ferial. |
| **Creador Independiente** | `creador@ecoferia.bo` | `Creador123!` | Rol creador/publicador para publicaci?n de cosechas y gesti?n de tareas propias. |
| **Consumidor (Cliente)** | `cliente@ecoferia.bo` | `Cliente123!` | Modo consulta en panel. Puede ver cat?logo y registrar reservas. Si intenta publicar cosechas o editar pedidos, recibe **HTTP 403 Forbidden**. |
| **Usuario Externo (Control)**| `beto@ecoferia.bo` | `Beto123!` | Usuario para comprobar privacidad: si intenta acceder a las tareas de Ana por ID, recibe **HTTP 403 Forbidden**. |

---

### ?? Certificaci?n de Calidad: 28 Pruebas Automatizadas (Pytest)

Ejecutar en la carpeta `backend`:
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest tests/ -v
```

**Resultado:**
```text
============================= 28 passed in 0.53s ==============================
```
- Pruebas de salud y Swagger UI (Tests 01 y 02).
- Autenticaci?n JWT, deduplicaci?n 409 Conflict y refresh rotativo (Tests 03 a 10).
- **Privacidad y Aislamiento por Propietario (Tests 11 a 16):** Consulta por ID de tarea ajena devuelve **403 Forbidden**, modificaci?n ajena devuelve **403 Forbidden**, eliminaci?n ajena devuelve **403 Forbidden**, recurso inexistente devuelve **404 Not Found**, y acceso de administrador devuelve **200 OK**.
- Casos de uso socioformativos feriales CU-01 al CU-04 (Tests 19 a 22).
- **Control de Acceso RBAC (Tests 23 a 26):** Consumidor recibe 403 al crear productos, Productor recibe 201, Creador/Publicador recibe 201 y Administrador tiene acceso total (200 OK).

---

### ?? Tablero de M?tricas de Sostenibilidad Digital

Auditor?a integrada en el Frontend (`SustainabilityDashboardView.jsx`):
1. **Presupuesto de Red:** Transferencia total de **116.7 KB gzip** (meta c?tedra < 500 KB, cumplimiento 76.6% m?s ligero).
2. **Huella de Carbono Digital:** **0.08 g CO? / visita** (meta c?tedra < 0.20 g, 83.3% m?s limpio que el promedio web global).
3. **Auditor?a Google Lighthouse:** **100/100** en Rendimiento, **100/100** en Accesibilidad (WCAG 2.1 AA), **100/100** en Buenas Pr?cticas y **100/100** en SEO T?cnico.
4. **Costo de Infraestructura:** **0.00 Bs / mes** (100% Free Tiers perpetuos de Cloudflare Pages, Render y Supabase).
