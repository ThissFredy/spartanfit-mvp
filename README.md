# Proyecto SpartanFit MVP

Este archivo define el contexto global del proyecto.

## Contexto del Proyecto

### 🏋️‍♂️ Project Overview
**SpartanFit MVP** es una plataforma web moderna de fitness y coaching. Está diseñada para ayudar a los usuarios a rastrear su progreso físico, registrar sus entrenamientos, consumir contenido de fitness e interactuar con entrenadores, mientras proporciona a los administradores herramientas robustas para gestionar usuarios y sucursales físicas de gimnasios.

### 🛠️ Tech Stack & Architecture
El proyecto está construido con un entorno full-stack JavaScript moderno:
*   **Framework:** Next.js (App Router) utilizando React Server Components y Server Actions.
*   **Styling:** Tailwind CSS, utilizando una estética premium, enfocada primero en el modo oscuro (dark-mode-first) con efectos de glassmorphism.
*   **Database & ORM:** PostgreSQL gestionado a través de **Prisma ORM**.
*   **BaaS / Authentication:** **Supabase** maneja tanto el alojamiento de PostgreSQL (vía connection pooling) como la Autenticación de Usuarios.
*   **Architecture Pattern:** Sigue un enfoque estructurado y en capas. Los componentes de UI viven en `components/`, la lógica de enrutamiento del lado del servidor en `app/`, los Next.js Server Actions en `actions/` (actuando como controladores), y la lógica pesada de base de datos/negocio se abstrae en `lib/services/`.

### ✨ Core Features & Modules
1. **User Identity & Profiles (`User`, `Role`):** Autenticación vía Supabase. Rastreo de datos vitales (edad, peso, altura, índice de actividad) y metas. Soporte RBAC (roles como `ADMIN`).
2. **Gym Network Management (`City`, `GymLocation`, `UserGym`):** Gestión de red de sucursales. Administradores tienen un dashboard para el CRUD de ciudades y gimnasios. Usuarios pueden multiseleccionar sus gimnasios.
3. **Fitness Tracking (`Metric`, `WorkoutLog`):** Registro de métricas corporales y de entrenamientos (peso, repeticiones y ejercicios por sesión).
4. **Educational Content (`Content`):** Contenido categorizado por dificultad con un flag único (`isScienceBacked`).
5. **Coaching & Communication (`ChatMessage`):** Sistema de chat para mensajes entre roles (ej. usuario y entrenador).

### 🤖 AI-Driven Workflow
Este repositorio utiliza un enfoque de **Spec-Driven Development** guiado por este archivo `AGENTS.md`. Los requerimientos se transforman en especificaciones técnicas (`specs/`) y el código se genera sistemáticamente (Base de datos -> Servicios -> Frontend) basándose en contratos aprobados.
## Configuracion de entorno local

1. Copia `.env.example` a `.env`.
2. Reemplaza placeholders con valores reales de Supabase y PostgreSQL.
3. No uses `example.supabase.co` en ejecucion real.
4. Ejecuta:
   - `npm install`
   - `npx prisma generate`
   - `npm run dev`

5. Para respuestas IA reales en `/chat`, define también:
   - `GEMINI_API_KEY`

Si `GEMINI_API_KEY` no está disponible, SpartanFit usa un fallback local de respuestas para no romper la experiencia.
