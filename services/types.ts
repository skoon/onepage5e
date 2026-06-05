import { Character } from "../types";

export interface AiProvider {
  initGame(character: Character, setting: string, goal: string, additionalNotes: string): Promise<string | undefined>;
  sendMessage(message: string): Promise<string>;
  generateCharacterPortrait(prompt: string): Promise<string | null>;
}
