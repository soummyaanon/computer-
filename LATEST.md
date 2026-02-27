# LATEST.md — Migrate ai-sdk-computer-use from Anthropic to OpenAI

## Goal

This template (`vercel-labs/ai-sdk-computer-use`) is built around **Anthropic Claude's Computer Use API** (provider-defined tools). If you want to use **OpenAI models** instead, you can—by **changing the model provider** and **rewriting the tools** so the model calls your tools (Zod schemas) and your tool code drives the E2B sandbox.

---

## Step 1: Install OpenAI provider

```bash
pnpm add @ai-sdk/openai

```

---

## Step 2: Replace Anthropic model in the API route

Open `app/api/chat/route.ts`.

### Replace the imports

```ts
// Before
import { anthropic } from "@ai-sdk/anthropic";

// After
import { openai } from "@ai-sdk/openai";
```

### Replace the model in `streamText`

```ts
// Before
model: anthropic("claude-3-7-sonnet-20250219"),

// After
model: openai("gpt-4o-mini"),
```

### Remove Anthropic-only providerOptions

Delete this block entirely:

```ts
providerOptions: {
  anthropic: { cacheControl: { type: "ephemeral" } },
},
```

---

## Step 3: Rewrite `lib/e2b/tool.ts`

```ts
// lib/e2b/tool.ts
import { tool } from "ai";
import { z } from "zod";
import { getDesktop, runBash, desktopAction } from "./your-e2b-impl";

export function computerTool(sandboxId: string) {
  return tool({
    description:
      "Use this to control the sandbox desktop. Actions: screenshot, click, type, key, scroll, move.",
    parameters: z.object({
      action: z
        .enum(["screenshot", "click", "type", "key", "scroll", "move"])
        .describe("Desktop action to perform"),
      x: z.number().optional().describe("X coordinate (pixels)"),
      y: z.number().optional().describe("Y coordinate (pixels)"),
      text: z.string().optional().describe("Text to type"),
      key: z.string().optional().describe("Key name, e.g. Enter, Tab, ArrowDown"),
      deltaY: z.number().optional().describe("Scroll delta (positive/negative)"),
    }),
    execute: async ({ action, x, y, text, key, deltaY }) => {
      if (action === "screenshot") {
        const desktop = await getDesktop(sandboxId);
        const pngBase64 = await desktop.screenshotBase64();
        return {
          type: "image",
          mediaType: "image/png",
          data: pngBase64,
        };
      }

      const result = await desktopAction(sandboxId, {
        action,
        x,
        y,
        text,
        key,
        deltaY,
      });

      return { ok: true, result };
    },
  });
}

export function bashTool(sandboxId: string) {
  return tool({
    description:
      "Run bash commands inside the sandbox. Use for file ops, installs, debugging, and scripts.",
    parameters: z.object({
      command: z.string().describe("Full bash command to execute, e.g. ls -la"),
    }),
    execute: async ({ command }) => {
      const out = await runBash(sandboxId, command);
      return out; // { stdout, stderr, exitCode }
    },
  });
}
```

---

## Step 4: Implement E2B wrappers `lib/e2b/your-e2b-impl.ts`

```ts
// lib/e2b/your-e2b-impl.ts
import { Sandbox } from "e2b";

export async function getDesktop(sandboxId: string) {
  // Connect to existing sandbox and return object with screenshotBase64()
  throw new Error("Implement getDesktop() using this repo's E2B utilities");
}

export async function desktopAction(
  sandboxId: string,
  input: {
    action: "click" | "type" | "key" | "scroll" | "move";
    x?: number;
    y?: number;
    text?: string;
    key?: string;
    deltaY?: number;
  }
) {
  // Map action to repo's existing desktop automation
  throw new Error("Implement desktopAction() using this repo's E2B utilities");
}

export async function runBash(sandboxId: string, command: string) {
  // Use sandbox.runCommand(...) and return { stdout, stderr, exitCode }
  throw new Error("Implement runBash() using this repo's E2B utilities");
}
```

---

## Step 5: Update the system prompt in `app/api/chat/route.ts`

```ts
system:
  "You are a helpful assistant with access to a sandbox desktop.\n" +
  "Use the computer tool to take screenshots and to click/type/scroll.\n" +
  "Use the bash tool to run commands, create/edit files, install packages.\n" +
  "When you need to see the screen, call computer with action=screenshot.\n" +
  "Prefer bash when possible. Keep going until the task is done.",
```

---

## Step 6: Set env vars in `.env.local`

```bash
OPENAI_API_KEY=sk-...
E2B_API_KEY=...
```

---

## Step 7: Enable tool-call streaming (optional but recommended)

```ts
const result = streamText({
  model: openai("gpt-4o-mini"),
  messages: prunedMessages(messages),
  system,
  tools: { computer: computerTool(sandboxId), bash: bashTool(sandboxId) },
  toolCallStreaming: true,
});
```

---

## Quick Checklist

- `@ai-sdk/openai` installed
- `app/api/chat/route.ts` uses `openai(...)` instead of `anthropic(...)`
- Removed Anthropic `providerOptions` block
- Rewrote `computerTool` / `bashTool` using `tool()` + `zod`
- Implemented E2B screenshot + desktop actions + bash execution
- `.env.local` uses `OPENAI_API_KEY` and `E2B_API_KEY`

