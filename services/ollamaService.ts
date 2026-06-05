import { Character } from "../types";
import { getSystemPrompt } from "./prompts";
import { AiProvider } from "./types";

interface OllamaMessage {
  role: string;
  content: string;
}

interface OllamaChatResponse {
  message: OllamaMessage;
  done: boolean;
}

export class OllamaProvider implements AiProvider {
  private messages: OllamaMessage[] = [];
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';
  }

  async initGame(character: Character, setting: string, goal: string, additionalNotes: string) {
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
