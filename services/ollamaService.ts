import { Character } from "../types";
import { getSystemPrompt } from "./prompts";
import { AiProvider } from "./types";
import { getSettings } from "./settings";

interface OllamaMessage {
  role: string;
  content: string;
}

interface OllamaChatResponse {
  message: OllamaMessage;
  done: boolean;
}

export async function pingOllama(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export class OllamaProvider implements AiProvider {
  private messages: OllamaMessage[] = [];
  private baseUrl: string;
  private model: string;

  constructor() {
    const settings = getSettings();
    this.baseUrl = settings.ollamaBaseUrl;
    this.model = settings.ollamaModel;
  }

  async initGame(character: Character, setting: string, goal: string, additionalNotes: string): Promise<string> {
    const reachable = await pingOllama(this.baseUrl);
    if (!reachable) {
      console.error("Ollama unreachable at", this.baseUrl);
      return `Can't reach Ollama at ${this.baseUrl} — is it running? (Config Error)`;
    }

    const systemPrompt = getSystemPrompt(character, setting, goal, additionalNotes);

    this.messages = [
      { role: 'system', content: systemPrompt },
    ];

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [...this.messages, { role: 'user', content: 'Begin the adventure.' }],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaChatResponse = await response.json();
      this.messages.push({ role: 'user', content: 'Begin the adventure.' });
      this.messages.push(data.message);
      return data.message.content;
    } catch (error) {
      console.error("Error starting game with Ollama:", error);
      return "The mists of Ravenloft... err, the adventure fails to load. (Ollama Error)";
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (this.messages.length === 0) {
      return "Error: Game session not initialized.";
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [...this.messages, { role: 'user', content: message }],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data: OllamaChatResponse = await response.json();
      this.messages.push({ role: 'user', content: message });
      this.messages.push(data.message);
      return data.message.content;
    } catch (error) {
      console.error("Error sending message to Ollama:", error);
      return "The spirits are silent. (Ollama Error)";
    }
  }

  async generateCharacterPortrait(_prompt: string): Promise<string | null> {
    console.warn("Portrait generation is not supported with Ollama. Use Gemini for this feature.");
    return null;
  }
}
