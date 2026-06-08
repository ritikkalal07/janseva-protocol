import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createAiGatewayProvider } from "./ai-gateway.server";

const SYSTEM_PROMPT = `You are JanSeva, a civic assistance AI helping people navigate government systems, file RTI requests, report corruption, access welfare benefits, and seek legal help across South Asia and Africa.

Rules:
- Match the user's language. If they write in Hindi, respond in Hindi. Tamil -> Tamil. Etc.
- Never invent specific laws, sections, or contact details you are not sure about.
- For serious legal matters, always recommend consulting a qualified lawyer.
- Set escalate=true for complex legal disputes, threats to safety, or anything requiring a human expert.
- Keep steps concrete and actionable.`;

const ResponseSchema = z.object({
  category: z.enum([
    "RTI Filing",
    "Legal Help",
    "Corruption Report",
    "Welfare Benefit",
    "Government Service",
    "Other",
  ]),
  summary: z.string(),
  steps: z.array(z.string()).min(1).max(8),
  important_note: z.string().optional(),
  escalate: z.boolean(),
  resources: z.array(z.string()).max(5).optional(),
});

export type CivicResponse = z.infer<typeof ResponseSchema>;

const Input = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .optional(),
  language: z.string().optional(),
});

export const civicAssist = createServerFn({ method: "POST" })
  .validator(Input)
  .handler(async ({ data }) => {
    try {
      const key = process.env.LOVABLE_API_KEY ?? process.env.AI_GATEWAY_API_KEY;
      if (!key) {
        return { ok: false as const, error: "AI service unavailable. Missing API key." };
      }

      const gateway = createAiGatewayProvider(key);
      const modelName = process.env.AI_MODEL?.trim() || "google/gemini-3-flash-preview";
      const model = gateway(modelName);

      const messages = [...(data.history ?? []), { role: "user" as const, content: data.message }];

      const result = await generateText({
        model,
        system:
          SYSTEM_PROMPT + (data.language ? `\nUser's preferred language: ${data.language}.` : ""),
        messages,
        experimental_output: Output.object({ schema: ResponseSchema }),
      });

      const outputCandidate =
        (result as { experimental_output?: unknown }).experimental_output ??
        (result as { output?: unknown }).output;
      const parsed = ResponseSchema.safeParse(outputCandidate);
      if (!parsed.success) {
        console.error("[civicAssist] invalid AI response format", parsed.error, {
          rawOutput: outputCandidate,
          fullResponse: result,
        });
        return {
          ok: false as const,
          error:
            "AI returned an unexpected response. Please try again or switch to Offline Library.",
        };
      }

      return { ok: true as const, response: parsed.data };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("429")) {
        return { ok: false as const, error: "Rate limit reached. Try again in a moment." };
      }
      if (msg.includes("402")) {
        return {
          ok: false as const,
          error: "AI credits exhausted. Please add credits in workspace settings.",
        };
      }
      console.error("[civicAssist]", e);
      return { ok: false as const, error: msg || "AI service temporarily unavailable." };
    }
  });
