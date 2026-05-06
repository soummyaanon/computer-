"use server";

import { Sandbox } from "@e2b/desktop";
import { resolution } from "./constants";
import type { DesktopActionInput } from "./constants";

const DEFAULT_SANDBOX_TIMEOUT_MS = 60 * 60 * 1000;
const DEFAULT_BASH_TIMEOUT_MS = 5 * 60 * 1000;
/** Use 0 to disable timeout for long-running desktop actions (e.g. scroll with large amount) */
const DEFAULT_DESKTOP_ACTION_TIMEOUT_MS = 0;

function parseNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const getDesktop = async (id?: string) => {
  try {
    const timeoutMs = parseNumberEnv(
      "E2B_SANDBOX_TIMEOUT_MS",
      DEFAULT_SANDBOX_TIMEOUT_MS
    );

    if (id) {
      const connected = await Sandbox.connect(id);
      const isRunning = await connected.isRunning();
      if (isRunning) {
        await connected.setTimeout(timeoutMs);
        // await connected.stream.start();
        return connected;
      }
    }

    const template = process.env.E2B_TEMPLATE?.trim();

    const sandboxOpts = {
      resolution: [resolution.x, resolution.y] as [number, number], // Custom resolution
      timeoutMs,
    };
    const desktop = template
      ? await Sandbox.create(template, sandboxOpts)
      : await Sandbox.create(sandboxOpts);
    await desktop.stream.start();
    return desktop;
  } catch (error) {
    console.error("Error in getDesktop:", error);
    throw error;
  }
};

export const getDesktopURL = async (id?: string) => {
  try {
    const desktop = await getDesktop(id);
    const streamUrl = desktop.stream.getUrl();

    return { streamUrl, id: desktop.sandboxId };
  } catch (error) {
    console.error("Error in getDesktopURL:", error);
    throw error;
  }
};

export const killDesktop = async (id: string = "desktop") => {
  const desktop = await getDesktop(id);
  await desktop.kill();
};

export async function desktopAction(
  sandboxId: string,
  input: DesktopActionInput
) {
  const desktop = await getDesktop(sandboxId);
  const { action, x, y, toX, toY, text, key, deltaY, ms } = input;

  switch (action) {
    case "click": {
      if (x === undefined || y === undefined) {
        throw new Error("x and y required for click action");
      }
      await desktop.moveMouse(x, y);
      await desktop.leftClick();
      return { ok: true, result: `Left clicked at ${x}, ${y}` };
    }
    case "rightClick": {
      if (x === undefined || y === undefined) {
        throw new Error("x and y required for rightClick action");
      }
      await desktop.rightClick(x, y);
      return { ok: true, result: `Right clicked at ${x}, ${y}` };
    }
    case "doubleClick": {
      if (x === undefined || y === undefined) {
        throw new Error("x and y required for doubleClick action");
      }
      await desktop.doubleClick(x, y);
      return { ok: true, result: `Double clicked at ${x}, ${y}` };
    }
    case "middleClick": {
      if (x === undefined || y === undefined) {
        throw new Error("x and y required for middleClick action");
      }
      await desktop.middleClick(x, y);
      return { ok: true, result: `Middle clicked at ${x}, ${y}` };
    }
    case "move": {
      if (x === undefined || y === undefined) {
        throw new Error("x and y required for move action");
      }
      await desktop.moveMouse(x, y);
      return { ok: true, result: `Moved mouse to ${x}, ${y}` };
    }
    case "type": {
      if (!text) throw new Error("text required for type action");
      await desktop.write(text);
      return { ok: true, result: `Typed: ${text}` };
    }
    case "key": {
      const keyToPress = key || text;
      if (!keyToPress) throw new Error("key required for key action");
      await desktop.press(keyToPress === "Return" ? "enter" : keyToPress);
      return { ok: true, result: `Pressed key: ${keyToPress}` };
    }
    case "hotkey": {
      const keyToPress = key || text;
      if (!keyToPress) throw new Error("key required for hotkey action");
      const combo = keyToPress.split("+").map((part) => part.trim()).filter(Boolean);
      if (combo.length < 2) {
        throw new Error("hotkey action requires a combo like Ctrl+L");
      }
      await desktop.press(combo);
      return { ok: true, result: `Pressed hotkey: ${combo.join("+")}` };
    }
    case "scroll": {
      if (deltaY === undefined) {
        throw new Error("deltaY required for scroll action");
      }
      const direction = deltaY >= 0 ? "down" : "up";
      const amount = Math.abs(deltaY);
      const button = direction === "up" ? "4" : "5";
      const actionTimeoutMs = parseNumberEnv(
        "E2B_DESKTOP_ACTION_TIMEOUT_MS",
        DEFAULT_DESKTOP_ACTION_TIMEOUT_MS
      );
      await desktop.commands.run(
        `xdotool click --repeat ${amount} ${button}`,
        { timeoutMs: actionTimeoutMs }
      );
      return { ok: true, result: `Scrolled ${direction} by ${amount}` };
    }
    case "drag": {
      if (
        x === undefined ||
        y === undefined ||
        toX === undefined ||
        toY === undefined
      ) {
        throw new Error("x, y, toX and toY required for drag action");
      }
      await desktop.drag([x, y], [toX, toY]);
      return { ok: true, result: `Dragged from ${x}, ${y} to ${toX}, ${toY}` };
    }
    case "wait": {
      if (ms === undefined || ms < 0) {
        throw new Error("non-negative ms required for wait action");
      }
      await desktop.wait(ms);
      return { ok: true, result: `Waited ${ms}ms` };
    }
    case "open": {
      if (!text) throw new Error("text required for open action");
      await desktop.open(text);
      return { ok: true, result: `Opened: ${text}` };
    }
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
}

export async function runBash(sandboxId: string, command: string) {
  const desktop = await getDesktop(sandboxId);
  try {
    const timeoutMs = parseNumberEnv("E2B_BASH_TIMEOUT_MS", DEFAULT_BASH_TIMEOUT_MS);
    const result = await desktop.commands.run(command, { timeoutMs });
    return {
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      exitCode: result.exitCode ?? 0,
    };
  } catch (error) {
    console.error("Bash command failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    return {
      stdout: "",
      stderr: `Error executing command: ${message}`,
      exitCode: 1,
    };
  }
}
