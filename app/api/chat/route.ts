import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, embed } from "ai";
import db from "@/lib/prisma";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, userStats } = await req.json();

    // Get the latest user message to find relevant context
    const lastMessage = messages[messages.length - 1];

    // Embed the user's query
    // Hacemos coincidir el string de búsqueda con el formato que usaste en Python
    const queryText = `task: search query | query: ${lastMessage.content}`;
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-002"), // Recomiendo dejar el 004 que es el equivalente oficial actual
      value: queryText,
    });

    // Format embedding array to postgres vector string format: '[0.1, 0.2, ...]'
    const vectorString = `[${embedding.join(",")}]`;

    // Query similar chunks from the database
    // Requires the match_knowledge_chunks RPC to be created in Supabase
    const chunks = await db.$queryRaw<
      Array<{ content: string; metadata: any }>
    >`
      SELECT content, metadata
      FROM match_knowledge_chunks(
        ${vectorString}::vector, 
        0.5, -- match_threshold 
        5    -- match_count
      )
    `;

    const contextTexts = chunks
      .map((chunk) => {
        const meta = chunk.metadata || {};
        const sourceInfo = meta.title
          ? `[Fuente: "${meta.title}" | Autor(es): ${meta.authors || "Desconocido"} | Categoría: ${meta.category || "N/A"}]`
          : "";
        return `${sourceInfo}\nContenido: ${chunk.content}`;
      })
      .join("\n\n---\n\n");

    // Construct the System Prompt
    const systemPrompt = `
Eres un Coach de SpartanFit. Tu tono debe ser neutro y profesional.
Estás ESTRICTAMENTE RESTRINGIDO a responder temas relacionados con nutrición y deporte.
Si el usuario pregunta algo fuera de estos temas, discúlpate y dile que solo puedes ayudarle con su entrenamiento y nutrición.
No inventes rutinas ni datos si no están respaldados por el conocimiento proporcionado o las estadísticas.

CONTEXTO DE CONOCIMIENTO (RAG):
${contextTexts}

ESTADÍSTICAS DEL USUARIO:
${JSON.stringify(userStats, null, 2)}

Responde de manera concisa y útil usando la información anterior.
`;

    // Create the chat completion stream
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
      temperature: 0.2,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Error processing your request", { status: 500 });
  }
}
