/**
 * Camada única de acesso ao provedor de IA (Lovable AI Gateway).
 * Trocar de provedor no futuro exige mudar apenas este arquivo.
 */

export const AI_SYSTEM_INSTRUCTIONS = `Você é um especialista em recrutamento, currículos e sistemas ATS.
Seu objetivo é ajudar o candidato a apresentar sua experiência real da forma mais relevante possível para determinada vaga.
Você deve analisar o currículo do candidato e a descrição da vaga.
Nunca invente informações.
Nunca atribua ao candidato uma habilidade, experiência, certificação, cargo, empresa, resultado ou tecnologia que não esteja presente ou claramente sustentada pelas informações fornecidas.
Você pode reorganizar, resumir, melhorar a redação e destacar informações existentes.
Você pode utilizar palavras-chave da vaga somente quando elas forem verdadeiramente compatíveis com a experiência ou informações fornecidas pelo candidato.
Quando uma informação não estiver presente, indique que ela não foi encontrada.
O currículo final deve ser profissional, claro, objetivo e ATS-friendly.
Não utilize linguagem exagerada ou promessas de contratação.
Responda sempre em português do Brasil.`;

const MODEL = "openai/gpt-6-astra";

/** Chama o modelo e devolve o texto final (streaming interno, sem timeout artificial). */
export async function generateAiText(prompt: string, jsonOnly = true): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI_NOT_CONFIGURED");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: AI_SYSTEM_INSTRUCTIONS,
      input: jsonOnly
        ? `${prompt}\n\nResponda somente com JSON válido, sem comentários e sem blocos de código.`
        : prompt,
      stream: true,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(`AI_ERROR_${response.status}:${detail.slice(0, 300)}`);
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let text = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (event.type === "response.output_text.delta" && event.delta) text += event.delta;
        if (event.type === "response.completed" && !text && event.response?.output_text) {
          text = event.response.output_text;
        }
      } catch {
        // ignora eventos parciais
      }
    }
  }

  return text.trim();
}

/** Extrai JSON de uma resposta do modelo de forma tolerante. */
export function parseAiJson<T>(raw: string): T | null {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  if (start < 0) return null;
  const candidate = cleaned.slice(start);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const lastBrace = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (lastBrace < 0) return null;
    try {
      return JSON.parse(candidate.slice(0, lastBrace + 1)) as T;
    } catch {
      return null;
    }
  }
}
