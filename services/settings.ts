export type ProviderType = 'gemini' | 'ollama';

export interface ProviderSettings {
  providerType: ProviderType;
  geminiApiKey: string;
  geminiModel: string;
  ollamaBaseUrl: string;
  ollamaModel: string;
}

const STORAGE_KEY = 'onepage5e:settings';

const defaults = (): ProviderSettings => ({
  providerType: 'gemini',
  geminiApiKey: process.env.API_KEY || '',
  geminiModel: 'gemini-2.5-flash',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2',
});

export function getSettings(): ProviderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
  } catch {
    return defaults();
  }
}

export function saveSettings(partial: Partial<ProviderSettings>): ProviderSettings {
  const next = { ...getSettings(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
