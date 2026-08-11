/**
 * Local AI Client (Ollama / Local FastAPI Backend)
 *
 * Provides optional zero-rate-limit, 100% private LLM fashion advice over local Wi-Fi / LAN.
 * No API key needed, no cloud rate limits.
 */

export interface LocalAiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LocalAiOptions {
  baseUrl?: string; // Default: http://localhost:11434 or local LAN IP
  model?: string;   // Default: llama3.2 / mistral / phi3
}

export async function checkLocalAiAvailability(baseUrl = "http://localhost:11434"): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${baseUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}

export async function generateLocalStylistAdvice(
  userPrompt: string,
  options: LocalAiOptions = {}
): Promise<string | null> {
  const baseUrl = options.baseUrl || "http://localhost:11434";
  const model = options.model || "llama3.2";

  try {
    const isAvailable = await checkLocalAiAvailability(baseUrl);
    if (!isAvailable) return null;

    const res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: `You are an expert personal fashion stylist for the ChuChu app. ${userPrompt}`,
        stream: false,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.response || null;
  } catch (error) {
    console.info("[Local AI] Local Ollama server not reachable:", error);
    return null;
  }
}
