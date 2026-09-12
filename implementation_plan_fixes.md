# Implementation Plan: Bug Fixes & Cleanup

Scope: fix the reproduced Gemini crash, remove the broken import, drop the unused
dependency, and dedupe a redundant client instantiation. No settings UI, no new
providers, no persistence — that's the separate provider/settings plan.

## 1. Fix the missing-API-key crash

**Root cause:** [services/geminiService.ts:10-16](services/geminiService.ts:10) returns
`undefined` (implicit) when `API_KEY` is unset, but the `catch` block a few lines down
returns a friendly string. [components/AdventureView.tsx:270](components/AdventureView.tsx:270)
then calls `msg.content.split('\n')` on that `undefined` and React throws — reproduced live as
a white-screen crash.

- `services/geminiService.ts` — in `initGame`, replace the bare `return;` on missing key with
  a returned string, matching the style of the existing catch-block message, e.g.:
  `"Gemini API key not configured. Set GEMINI_API_KEY in .env.local, or switch to Ollama. (Config Error)"`
- `services/types.ts` — tighten `AiProvider.initGame`'s return type from
  `Promise<string | undefined>` to `Promise<string>` so this class of bug is caught by
  the type checker in the future.
- `components/AdventureView.tsx` — in `handleStart`, add a defensive fallback anyway
  (`introText ?? "Error: The adventure failed to start."`) so a future provider regression
  degrades to an error bubble instead of a crash.
- `services/ollamaService.ts` — no functional change; confirmed it already returns a string
  on every path. Leaving as a reference implementation for the message style.

## 2. Remove the broken `Icons` import

`components/DiceRoller.tsx:2` imports `D20Icon, D6Icon, D4Icon, D8Icon, D10Icon, D12Icon`
from `./Icons`, a file that doesn't exist. `tsc --noEmit` fails on it; the dev server and
build only survive because the unused bindings get elided. `DieIcon` below already
implements its own inline SVGs, so the import is dead code.

- `components/DiceRoller.tsx` — delete line 2 entirely.

## 3. Remove unused `clijs` dependency

`clijs` is listed in `package.json` and `package-lock.json` but never imported anywhere
in `App.tsx`, `components/`, or `services/` (confirmed via grep).

- `package.json` — remove `"clijs": "^0.1.2"` from `dependencies`.
- Run `npm install` to regenerate `package-lock.json` without the `clijs` entries.

## 4. Dedupe `GoogleGenAI` instantiation in `geminiService.ts`

`generateCharacterPortrait` currently constructs a second `new GoogleGenAI({apiKey})`
even though `initGame` already creates and stores one on `this.aiInstance`. Note
`generateCharacterPortrait` can be called *before* `initGame` (portrait generation happens
during character creation, before the adventure starts), so the fix must lazily
create-and-cache rather than assume `aiInstance` already exists:

```ts
async generateCharacterPortrait(prompt: string): Promise<string | null> {
  if (!this.aiInstance) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API Key missing");
      return null;
    }
    this.aiInstance = new GoogleGenAI({ apiKey });
  }
  // ... use this.aiInstance instead of a locally-scoped `ai`
}
```

## Verification

- `npx tsc --noEmit` → zero errors (currently fails on the `Icons` import).
- `npm run build` → succeeds (already does, but confirm no regression).
- `npm ls clijs` → reports not found.
- Manual, no `.env.local` present: create a character, click "Start Game" → expect a
  visible chat bubble with the config-error message, not a blank/crashed screen.
- Manual, invalid `GEMINI_API_KEY` set (to force the network-error catch path): confirm
  the existing "(API Error)" fallback message still renders correctly (unchanged behavior).

## Risk

All four changes are small and isolated (one string, one deleted import line, one
package.json line, one method body). No schema, API, or UI changes. Easy to revert
individually via git if anything regresses.
