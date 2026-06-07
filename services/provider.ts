import { AiProvider } from './types';
import { GeminiProvider } from './geminiService';
import { OllamaProvider } from './ollamaService';

export type ProviderType = 'gemini' | 'ollama';

let currentProvider: AiProvider = new GeminiProvider();

export function setProvider(type: ProviderType) {
  currentProvider = type === 'gemini' ? new GeminiProvider() : new OllamaProvider();
}

export function getProvider(): AiProvider {
  return currentProvider;
}
