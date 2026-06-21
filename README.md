# SpartanFit MVP Project

This file defines the global context of the project.

## Project Context

### 🏋️‍♂️ Project Overview

**SpartanFit MVP** is a modern fitness and coaching web platform. It is designed to help users track their fitness progress, log their workouts, consume fitness content, and interact with coaches, while providing administrators with robust tools to manage users and physical gym branches.

### 🛠️ Tech Stack & Architecture

The project is built with a modern full-stack JavaScript environment:

* **Framework:** Next.js (App Router) using React Server Components and Server Actions.
* **Styling:** Tailwind CSS, using a premium, dark-mode-first aesthetic with glassmorphism effects.
* **Database & ORM:** PostgreSQL managed through **Prisma ORM**.
* **BaaS / Authentication:** **Supabase** handles both PostgreSQL hosting (via connection pooling) and User Authentication.
* **Architecture Pattern:** Follows a structured, layered approach. UI components live in `components/`, server-side routing logic in `app/`, Next.js Server Actions in `actions/` (acting as controllers), and heavy database/business logic is abstracted in `lib/services/`.

### ✨ Core Features & Modules

1. **User Identity & Profiles (`User`, `Role`):** Authentication via Supabase. Tracking of vital data (age, weight, height, activity index) and goals. RBAC support (roles like `ADMIN`).
2. **Gym Network Management (`City`, `GymLocation`, `UserGym`):** Branch network management. Administrators have a dashboard for City and Gym CRUD operations. Users can multi-select their gyms.
3. **Fitness Tracking (`Metric`, `WorkoutLog`):** Logging of body metrics and workouts (weight, reps, and exercises per session).
4. **Educational Content (`Content`):** Content categorized by difficulty with a unique flag (`isScienceBacked`).
5. **Coaching & Communication (`ChatMessage`):** Chat system for messaging between roles (e.g., user and coach).

### 🤖 AI-Driven Workflow

This repository uses a **Spec-Driven Development** approach guided by this `AGENTS.md` file. Requirements are transformed into technical specifications (`specs/`) and code is systematically generated (Database -> Services -> Frontend) based on approved contracts.
