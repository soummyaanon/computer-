import { UIMessage } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ABORTED = "User aborted";

/** Max messages to keep in context to avoid token limit (272k). */
const MAX_MESSAGES = 30;

const REDACTED_IMAGE = {
  type: "text" as const,
  text: "[Screenshot redacted to save tokens]",
};

export const prunedMessages = (messages: UIMessage[]): UIMessage[] => {
  const truncated =
    messages.length > MAX_MESSAGES
      ? messages.slice(-MAX_MESSAGES)
      : messages;

  return truncated.map((message) => ({
    ...message,
    parts: message.parts.map((part) => {
      if (part.type !== "tool-invocation") return part;

      const { toolInvocation } = part;
      const result =
        "result" in toolInvocation
          ? (toolInvocation.result as { type?: string; data?: string })
          : undefined;

      // Redact any image result (screenshots) to avoid token overflow
      if (result?.type === "image" || (result && "data" in result)) {
        return {
          ...part,
          toolInvocation: {
            ...toolInvocation,
            result: REDACTED_IMAGE,
          },
        };
      }
      return part;
    }),
  }));
};
