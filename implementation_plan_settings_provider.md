# Implementation Plan: Settings UI & Provider Configurability

Scope: make Gemini/Ollama configuration editable at runtime (no rebuild), persist it
across reloads, stop mid-adventure provider switches from silently breaking the session,
and add an Ollama reachability check. Assumes the fixes in
`implementation_plan_fixes.md` have already landed.

Explicitly deferred (call out separately, not built here unless requested):
- A generic OpenAI-compatible provider (LM Studio / vLLM / OpenRouter / Groq, etc.).
- Live provider switching *with* conversation context carried over mid-adventure —
  this build only disables switching during an active game.
- A backend proxy for the Gemini key — this stays a client-only app; the key is still
  visible in the browser once entered, just no longer baked into the JS bundle at build time.

## 1. New settings storage module: `services/settings.ts`

```ts
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
```

- `.env.local` values remain the first-run defaults (existing users see no change), but
  anything saved via the UI overrides them from then on.
- The API key never gets logged; it's stored in `localStorage` only (same trust boundary
  it already has today via the build-time bundle — see the security note in the review).

## 2. Providers read from settings instead of `process.env`

- `services/geminiService.ts` — replace both `process.env.API_KEY` reads with
  `getSettings().geminiApiKey`; replace hardcoded `'gemini-2.5-flash'` /
  `'gemini-2.5-flash-image'` with `getSettings().geminiModel` (keep the image model
  suffix logic or add a second optional setting if needed — default to today's hardcoded
  value if the field is blank).
- `services/ollamaService.ts` — replace the constructor's `process.env.OLLAMA_BASE_URL` /
  `OLLAMA_MODEL` reads with `getSettings().ollamaBaseUrl` / `getSettings().ollamaModel`.
- `vite.config.ts` — no change needed; its `define` block still seeds `process.env.*`,
  which `defaults()` reads as a fallback.

## 3. Settings UI: `components/SettingsModal.tsx`

New modal component, opened via a gear icon added next to the Gemini/Ollama toggle in
`App.tsx`'s header.

- Local state initialized from `getSettings()`.
- Tabs or a simple conditional block for Gemini vs. Ollama fields:
  - **Gemini:** API key (`<input type="password">` with a show/hide eye-icon toggle),
    model name (text input, placeholder `gemini-2.5-flash`).
  - **Ollama:** base URL (text input), model name (text input), and a "Test Connection"
    button (see §5) showing an inline ✅/❌ status.
- Save → `saveSettings(formState)`, close modal. Cancel → discard local edits, close.
- No new dependency needed; reuse the existing Tailwind utility classes already used
  throughout the app for visual consistency.

`App.tsx` changes:
- Add `settingsOpen` state and a gear button in the header.
- Initialize `providerType` state from `getSettings().providerType` instead of the
  hardcoded `'gemini'` literal.
- `handleProviderChange` also calls `saveSettings({ providerType: type })`.

## 4. Disable provider switching during an active adventure

Switching providers mid-game currently discards the live chat/session silently (new
provider instance, empty history) and the next message returns
`"Error: Game session not initialized."`

- Lift a `gameStarted` boolean out of `AdventureView` (or derive
  `screen === 'ADVENTURE' && character !== null` in `App.tsx` — simpler, and already
  available) and use it to add `disabled` + a `title="Finish or restart your adventure to
  switch providers"` tooltip to both toggle buttons in the header.
- This is intentionally the simple fix. Carrying context over to a new provider mid-chat
  is a separate, prompt-design-affecting change — noted as deferred above.

## 5. Ollama reachability check

- `services/ollamaService.ts` — add:
  ```ts
  export async function pingOllama(baseUrl: string): Promise<boolean> {
    try {
      const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }
  ```
- Used by:
  - `SettingsModal`'s "Test Connection" button (direct call, shows ✅/❌ inline).
  - Optionally, `AdventureView.handleStart` — when `providerType === 'ollama'`, ping first
    and show `"Can't reach Ollama at {baseUrl} — is it running?"` instead of letting the
    generic `initGame` catch-all produce its flavor-text error.

## Verification

- `npx tsc --noEmit`, `npm run build`.
- Manual: with no `.env.local` at all, open Settings, enter a Gemini API key, save,
  start an adventure → confirm it works, proving runtime config actually reaches the
  provider (not just build-time env).
- Manual: reload the page after saving settings → provider type and field values persist.
- Manual: in Settings, point Ollama at a bogus URL, click Test Connection → expect a
  failure indicator; point at a real local Ollama instance (if available) → expect success.
- Manual: start an adventure, confirm the Gemini/Ollama toggle buttons become visibly
  disabled with the tooltip.

## Risk

Moderate — touches `App.tsx`, both provider services, and adds one new component and one
new module. No existing data model changes (`Character`, `ChatMessage` untouched). The
riskiest part is making sure `defaults()` correctly falls back to today's `.env.local`
behavior so existing local-dev workflows don't regress — call this out explicitly during
review/testing.
