import { ConsultationPrompt, ConsultationResult } from "./types";
import { generateWithOpenAI } from "./openaiProvider";

// Single point to swap AI providers (e.g. to Claude) later without touching
// the UI or the API route.
export async function generateConsultation(
  prompt: ConsultationPrompt
): Promise<ConsultationResult> {
  return generateWithOpenAI(prompt);
}
