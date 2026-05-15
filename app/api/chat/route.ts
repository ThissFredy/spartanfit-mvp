import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import db from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: queryText,
      config: {
        outputDimensionality: 768,
      },
    });

    if (!response.embeddings || response.embeddings.length === 0) {
      throw new Error("Failed to generate embedding");
    }

    const rawValues = response.embeddings[0].values;
    const vectorString = `[${rawValues.join(", ")}]`;
    console.log("Type: ", typeof vectorString);

    // Format embedding array to postgres vector string format: '[0.1, 0.2, ...]'

    console.log("embedding: ", vectorString);

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

    if (!messages || messages.length === 0) {
      throw new Error("El array de mensajes está vacío desde el cliente.");
    }

    const coreMessages = messages.map((msg: any) => {
      // Extraemos el texto ya sea del nuevo formato 'parts' o del antiguo 'content'
      let textContent = "";
      if (Array.isArray(msg.parts)) {
        textContent = msg.parts.map((p: any) => p.text || "").join(" ");
      } else if (typeof msg.content === "string") {
        textContent = msg.content;
      }

      return {
        role:
          msg.role === "user" ||
          msg.role === "assistant" ||
          msg.role === "system"
            ? msg.role
            : "user",
        content: textContent.trim() !== "" ? textContent : "[Mensaje vacío]",
      };
    });

    // 2. Pasamos el array limpio al streamText
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: coreMessages,
      temperature: 0.2,
      onFinish: ({ usage, finishReason }) => {
        // Esto es opcional, pero te sirve para saber cuándo terminó
        console.log("✅ Chat completado!");
        console.log("Tokens usados:", usage);
      },
    });

    console.log("Result: ", result);

    return Response.json({ content: result.text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Error processing your request", { status: 500 });
  }
}
