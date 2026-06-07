import { GoogleGenAI, Chat } from "@google/genai";
import { Character } from "../types";
import { getSystemPrompt } from "./prompts";
import { AiProvider } from "./types";

export class GeminiProvider implements AiProvider {
  private chatSession: Chat | null = null;
  private aiInstance: GoogleGenAI | null = null;

  async initGame(character: Character, setting: string, goal: string, additionalNotes: string) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API Key missing");
      return;
    }

    this.aiInstance = new GoogleGenAI({ apiKey });

    this.chatSession = this.aiInstance.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemPrompt(character, setting, goal, additionalNotes),
        temperature: 0.9,
      },
    });

    try {
      const response = await this.chatSession.sendMessage({
        message: "Begin the adventure."
      });
      return response.text;
    } catch (error) {
      console.error("Error starting game:", error);
      return "The mists of Ravenloft... err, the adventure fails to load. (API Error)";
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) {
      return "Error: Game session not initialized.";
    }

    try {
      const response = await this.chatSession.sendMessage({ message });
      return response.text;
    } catch (error) {
      console.error("Error sending message:", error);
      return "The spirits are silent. (API Error)";
    }
  }

  async generateCharacterPortrait(prompt: string): Promise<string | null> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API Key missing");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error generating portrait:", error);
      return null;
    }
  }
}
