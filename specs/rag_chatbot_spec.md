# Especificación: Chatbot con Sistema RAG (Gemini) y Estadísticas de Usuario

## 1. Descripción General
Implementar una interfaz de chat en la ruta `/chat` para que los usuarios interactúen con un "Coach virtual". El chatbot utilizará el ecosistema de **Google Gemini** para la vectorización (embeddings) y generación de texto. Estará respaldado por un sistema RAG (Retrieval-Augmented Generation) basado en la tabla `KnowledgeChunk` utilizando `pgvector`, y recibirá en su System Prompt el contexto en tiempo real de las estadísticas del usuario extraídas de `UserStats`.

## 2. Reglas de Negocio
- **Proveedor IA:** Google Gemini (texto y embeddings).
- **Saludo Inicial Estático:** El chat inicia con un mensaje de bienvenida predeterminado por parte del bot, el cual no es generado por el LLM ni pasa por el RAG. Este saludo incluirá el nombre real del usuario (obtenido de la base de datos). 
- **Flujo RAG:**
  - Al enviar un mensaje, el sistema generará un embedding de la consulta del usuario.
  - Ejecutará una función RPC en Supabase para buscar similitud de coseno en `KnowledgeChunk` y extraerá los fragmentos más relevantes.
  - Formará un *System Prompt* que incluye los fragmentos encontrados y el JSON de `UserStats` del usuario.
- **Memoria Efímera:** El historial de mensajes se almacenará localmente en el cliente (ej. usando un estado de React) y se mantendrá únicamente mientras dure la sesión activa de esa vista. No se guardarán los mensajes en la tabla `ChatMessage`.
- **Personalidad y Restricciones:**
  - El bot adoptará un tono **neutro**, desempeñando el rol de coach.
  - Estará **estrictamente restringido** a responder temas relacionados con nutrición y deporte. Cualquier otra solicitud o intento de hablar de otros temas será denegado educadamente.

## 3. Arquitectura y Componentes
- **Ruta principal:** `app/chat/page.tsx`
  - Server Component.
  - Verifica la sesión del usuario.
  - Obtiene el nombre del usuario y sus datos de `UserStats` desde la DB.
  - Pasa esta información inicial como props al componente cliente.
- **Componente UI:** `src/components/features/chat/ChatInterface.tsx`
  - Componente de cliente (`"use client"`).
  - Gestiona la lista de mensajes de la sesión (React state).
  - Inicializa la conversación con el saludo estático personalizado (`"Hola [Nombre], ¿en qué te puedo ayudar hoy con tu entrenamiento o nutrición?"`).
- **Route Handler (API):** `src/app/api/chat/route.ts`
  - Recibe la historia de la conversación, la consulta actual y los datos del usuario (`UserStats`).
  - Llama al endpoint de embeddings de Gemini para vectorizar la consulta.
  - Llama a RPC de Postgres/Supabase para la búsqueda de contexto.
  - Construye el prompt final y ejecuta el request a la API de generación de Gemini (idealmente usando streaming).
  - Devuelve la respuesta al cliente.

## 4. Dependencias Técnicas o Tareas Previas Requeridas
- Configuración de variables de entorno para la API Key de Google Gemini (`GEMINI_API_KEY`).
- Creación y prueba de la función RPC (`match_knowledge_chunks` o similar) en PostgreSQL/Supabase que use `pgvector` para buscar similitud.
- Setup del AI SDK de Vercel (opcional pero recomendado, `npm install ai`) para facilitar el streaming y manejo del estado de chat en React.
