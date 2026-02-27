import { tool, zodSchema } from "ai";
import { z } from "zod";
import { getDesktop, desktopAction, runBash } from "./utils";
import { resolution } from "./constants";

export { resolution };

export function computerTool(sandboxId: string) {
  return tool({
    description:
      "Use this to control the sandbox desktop. Actions: screenshot, click, rightClick, doubleClick, middleClick, type, key, hotkey, scroll, move, drag, wait, open.",
    parameters: zodSchema(z.object({
      action: z
        .enum([
          "screenshot",
          "click",
          "rightClick",
          "doubleClick",
          "middleClick",
          "type",
          "key",
          "hotkey",
          "scroll",
          "move",
          "drag",
          "wait",
          "open",
        ])
        .describe("Desktop action to perform"),
      x: z
        .number()
        .nullable()
        .describe("X coordinate (pixels). Use null when not applicable."),
      y: z
        .number()
        .nullable()
        .describe("Y coordinate (pixels). Use null when not applicable."),
      toX: z
        .number()
        .nullable()
        .describe("Drag end X (pixels). Use null unless action=drag."),
      toY: z
        .number()
        .nullable()
        .describe("Drag end Y (pixels). Use null unless action=drag."),
      text: z
        .string()
        .nullable()
        .describe("Text payload for type/open, or optional key value."),
      key: z
        .string()
        .nullable()
        .describe(
          "Key name for key/hotkey. For hotkey use combos like Ctrl+L.",
        ),
      deltaY: z
        .number()
        .nullable()
        .describe("Scroll delta (positive/negative). Use null for other actions."),
      ms: z
        .number()
        .nullable()
        .describe("Wait duration in milliseconds. Use null unless action=wait."),
    })),
    execute: async ({ action, x, y, toX, toY, text, key, deltaY, ms }) => {
      if (action === "screenshot") {
        const desktop = await getDesktop(sandboxId);
        const image = await desktop.screenshot();
        const pngBase64 = Buffer.from(image).toString("base64");
        return {
          type: "image",
          mediaType: "image/png",
          data: pngBase64,
        };
      }

      const result = await desktopAction(sandboxId, {
        action,
        x: x ?? undefined,
        y: y ?? undefined,
        toX: toX ?? undefined,
        toY: toY ?? undefined,
        text: text ?? undefined,
        key: key ?? undefined,
        deltaY: deltaY ?? undefined,
        ms: ms ?? undefined,
      });

      return { ok: true, result };
    },
  });
}

export function bashTool(sandboxId: string) {
  return tool({
    description:
      "Run bash commands inside the sandbox. Use for file ops, installs, debugging, and scripts.",
    parameters: zodSchema(z.object({
      command: z
        .string()
        .describe("Full bash command to execute, e.g. ls -la"),
    })),
    execute: async ({ command }) => {
      const out = await runBash(sandboxId, command);
      return out;
    },
  });
}
