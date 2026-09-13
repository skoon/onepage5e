import { AiProvider } from './types';
import { GeminiProvider } from './geminiService';
import { OllamaProvider } from './ollamaService';
import { getSettings, ProviderType } from './settings';

export type { ProviderType };

let currentProvider: AiProvider = getSettings().providerType === 'ollama' ? new OllamaProvider() : new GeminiProvider();

export function setProvider(type: ProviderType) {
  currentProvider = type === 'gemini' ? new GeminiProvider() : new OllamaProvider();
}

export function getProvider(): AiProvider {
  return currentProvider;
}
