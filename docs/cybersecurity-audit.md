# Auditoría de Ciberseguridad: SpartanFit MVP

A continuación, presento el informe de auditoría de seguridad y mejores prácticas para el proyecto SpartanFit MVP. Se han detectado varias vulnerabilidades críticas, principalmente relacionadas con el control de acceso en las Server Actions de Next.js.

> [!CAUTION]
> **No he realizado ningún cambio en el código fuente.** Las siguientes brechas requieren atención inmediata antes de considerar el paso a un entorno de producción.

---

## 1. Vulnerabilidades Críticas (Prioridad Alta)

### 1.1. Insecure Direct Object Reference (IDOR) en `workout.actions.ts`
Las Server Actions encargadas de registrar y consultar los entrenamientos (`addWorkoutLog` y `getUserWorkoutProgress`) no verifican la sesión del usuario.
- **Problema:** En `addWorkoutLog`, se acepta el parámetro `userId` directamente desde el cliente. Un atacante puede interceptar la petición y cambiar este `userId` por el de otro usuario para crearle registros falsos o alterar sus métricas.
- **Ubicación:** `actions/workout.actions.ts`
- **Mitigación:** En lugar de recibir `userId` como parámetro, se debe obtener el ID del usuario autenticado directamente desde el servidor usando `await supabase.auth.getUser()`.

### 1.2. Broken Access Control (Falta de Autenticación en Actions Administrativos)
Varias Server Actions que modifican el catálogo de la aplicación (Gimnasios, Ciudades y Ejercicios) carecen por completo de validación de sesión y permisos.
- **Problema:** Cualquier usuario (incluso no autenticado) que conozca la ruta de la Server Action puede invocar métodos como `createGym`, `updateCity`, o `createExercise` para alterar la base de datos de la plataforma. La protección solo existe en el Frontend (ocultando los botones), pero el Backend (Server Actions) está expuesto.
- **Ubicaciones:**
  - `actions/gym.actions.ts`
  - `actions/city.actions.ts`
  - `actions/exercise.actions.ts`
- **Mitigación:** Implementar una función `ensureAdmin()` (similar a la que se usa en `actions/admin.actions.ts`) al inicio de cada una de estas funciones para garantizar que solo un administrador autenticado pueda ejecutarlas.

---

## 2. Vulnerabilidades Medias (Arquitectura y Autenticación)

### 2.1. Ausencia de Middleware en Next.js (Manejo de Sesión)
El proyecto utiliza `@supabase/ssr` para la autenticación, pero **no cuenta con un archivo `middleware.ts`**.
- **Problema:** Según la documentación de Supabase y los propios comentarios autogenerados en `utils/supabase/server.ts`, el Middleware es crucial para refrescar los *tokens* (cookies) de sesión caducados cuando se navega entre Server Components. Sin el middleware, la sesión de los usuarios puede expirar silenciosamente o causar errores intermitentes al interactuar con las Server Actions tras cierto tiempo de inactividad. Además, la protección de rutas actualmente depende de validaciones manuales en cada componente (ej. `app/admin/users/page.tsx`), lo que es propenso a errores humanos (olvidar proteger una nueva ruta).
- **Mitigación:** Implementar un `middleware.ts` en la raíz (o en `src/`) que llame a `supabase.auth.getUser()` o utilice las funciones recomendadas de Supabase para renovar cookies y proteger rutas protegidas (`/dashboard`, `/admin`, `/profile`) de forma centralizada.

### 2.2. Exposición de Secretos (`.env`)
Se detectó un archivo `.env` que incluye cadenas de conexión sensibles (como `DATABASE_URL` con usuario y contraseña del pooler y la clave de la API `GEMINI_API_KEY`).
- **Problema:** Si este archivo `.env` es enviado al repositorio de control de versiones (Git), cualquier persona con acceso al repositorio tendrá las credenciales de la base de datos de producción y de facturación de la API de IA.
- **Mitigación:** Asegurarse de que el archivo `.env` o `.env.local` esté correctamente incluido en el archivo `.gitignore` (actualmente está configurado, pero se debe revisar que no se haya comiteado previamente). En producción (ej. Vercel), estas variables deben cargarse directamente en la plataforma.

---

## 3. Prácticas Mejorables (Prioridad Baja)

### 3.1. Rate Limiting (Ausente)
No existe ninguna protección contra ataques de denegación de servicio (DoS) a nivel de aplicación, especialmente en funciones costosas.
- **Problema:** Un bot malicioso podría saturar la función `sendChatMessageAction` repetidamente. Esto no solo degradaría el rendimiento de la base de datos, sino que agotaría el límite (o generaría costos altísimos) en el uso de la API de Google Gemini.
- **Mitigación:** Implementar un Rate Limiter (ej. Upstash o Vercel KV) en las Server Actions críticas para restringir el número de solicitudes por usuario/minuto.

### 3.2. Fuga de Detalles de Error en el Servidor (Information Disclosure)
- **Problema:** En archivos como `gym.actions.ts`, los errores devueltos incluyen bloques como `console.error("Error creating gym:", error)`. En un entorno productivo es mejor utilizar herramientas de monitoreo (como Sentry o Datadog) y evitar mostrar (o loguear de forma insegura) detalles de la estructura de la base de datos (Prisma Errors).

---

## Resumen de Acción Inmediata
Te sugiero empezar por arreglar las vulnerabilidades críticas de las **Server Actions** añadiendo chequeos de autorización (`createClient().auth.getUser()`) en los módulos de `gym`, `city`, `exercise` y especialmente en `workout.actions.ts`. 

¿Deseas que comience a aplicar estas correcciones en el código de forma progresiva?
