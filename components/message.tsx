"use client";

import type { Message } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import equal from "fast-deep-equal";
import { Streamdown } from "streamdown";

import { ABORTED, cn } from "@/lib/utils";
import {
  Camera,
  CheckCircle,
  CircleSlash,
  Download,
  Keyboard,
  KeyRound,
  Loader2,
  MousePointer,
  ScrollText,
  StopCircle,
} from "lucide-react";

function formatBytes(bytes: number | null | undefined) {
  if (bytes == null || !Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const PurePreviewMessage = ({
  message,
  isLatestMessage,
  status,
}: {
  message: Message;
  isLoading: boolean;
  status: "error" | "submitted" | "streaming" | "ready";
  isLatestMessage: boolean;
}) => {
  return (
    <AnimatePresence key={message.id}>
      <motion.div
        className="w-full mx-auto px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={`message-${message.id}`}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            "group-data-[role=user]/message:w-fit",
          )}
        >
          {/* {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )} */}

          <div className="flex flex-col w-full">
            {message.parts?.map((part, i) => {
              switch (part.type) {
                case "text":
                  return (
                    <motion.div
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      key={`message-${message.id}-part-${i}`}
                      className="flex flex-row gap-2 items-start w-full pb-4"
                    >
                      <div
                        className={cn("flex flex-col gap-4", {
                          "bg-secondary text-secondary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        <Streamdown>{part.text}</Streamdown>
                      </div>
                    </motion.div>
                  );
                case "tool-invocation":
                  const { toolName, toolCallId, state, args } =
                    part.toolInvocation;

                  if (toolName === "computer") {
                    const argsObj = args ?? {}
                    const action = argsObj.action
                    const x = argsObj.x ?? argsObj.coordinate?.[0]
                    const y = argsObj.y ?? argsObj.coordinate?.[1]
                    const text = argsObj.text
                    const key = argsObj.key
                    const deltaY = argsObj.deltaY ?? argsObj.scroll_amount
                    let actionLabel = ""
                    let actionDetail = ""
                    let ActionIcon = null

                    switch (action) {
                      case "screenshot":
                        actionLabel = "Taking screenshot";
                        ActionIcon = Camera;
                        break;
                      case "click":
                        actionLabel = "Left clicking";
                        actionDetail =
                          x !== undefined && y !== undefined
                            ? `at (${x}, ${y})`
                            : "";
                        ActionIcon = MousePointer;
                        break;
                      case "move":
                        actionLabel = "Moving mouse";
                        actionDetail =
                          x !== undefined && y !== undefined
                            ? `to (${x}, ${y})`
                            : "";
                        ActionIcon = MousePointer;
                        break;
                      case "type":
                        actionLabel = "Typing";
                        actionDetail = text ? `"${text}"` : "";
                        ActionIcon = Keyboard;
                        break;
                      case "key":
                        actionLabel = "Pressing key";
                        actionDetail = (key ?? text) ? `"${key ?? text}"` : "";
                        ActionIcon = KeyRound;
                        break;
                      case "scroll":
                        actionLabel = "Scrolling";
                        actionDetail =
                          deltaY !== undefined
                            ? `by ${deltaY}`
                            : "";
                        ActionIcon = ScrollText;
                        break;
                      default:
                        actionLabel = action ?? "Computer action";
                        ActionIcon = MousePointer;
                        break;
                    }

                    return (
                      <motion.div
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        key={`message-${message.id}-part-${i}`}
                        className="flex flex-col gap-2 p-2 mb-3 text-sm bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <div className="flex items-center justify-center w-8 h-8 bg-zinc-50 dark:bg-zinc-800 rounded-full">
                            {ActionIcon && <ActionIcon className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium font-mono flex items-baseline gap-2">
                              {actionLabel}
                              {actionDetail && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                                  {actionDetail}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-5 h-5 flex items-center justify-center">
                            {state === "call" ? (
                              isLatestMessage && status !== "ready" ? (
                                <Loader2 className="animate-spin h-4 w-4 text-zinc-500" />
                              ) : (
                                <StopCircle className="h-4 w-4 text-red-500" />
                              )
                            ) : state === "result" ? (
                              part.toolInvocation.result === ABORTED ? (
                                <CircleSlash
                                size={14}
                                className="text-amber-600"
                                />                              ) : (
                                <CheckCircle
                                  size={14}
                                  className="text-green-600"
                                />
                              )
                            ) : null}
                          </div>
                        </div>
                        {state === "result" ? (
                          part.toolInvocation.result?.type === "image" && (
                            <div className="p-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`data:image/png;base64,${part.toolInvocation.result?.data ?? ""}`}
                                alt="Generated Image"
                                className="w-full aspect-[1024/768] rounded-sm"
                              />
                            </div>
                          )
                        ) : action === "screenshot" ? (
                          <div className="w-full aspect-[1024/768] rounded-sm bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
                        ) : null}
                      </motion.div>
                    );
                  }
                  if (toolName === "download") {
                    const result = state === "result" ? part.toolInvocation.result : null;
                    const files: Array<{ name: string; path: string; url: string; size: number | null; error?: string }> =
                      result?.files ?? [];
                    const requestedPaths: string[] = args?.paths ?? [];

                    return (
                      <motion.div
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        key={`message-${message.id}-part-${i}`}
                        className="flex flex-col gap-2 p-3 mb-3 text-sm bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-zinc-50 dark:bg-zinc-800 rounded-full">
                            <Download className="w-4 h-4" />
                          </div>
                          <div className="font-medium">
                            {state === "result" ? "Files ready to download" : "Preparing downloads..."}
                          </div>
                          <div className="ml-auto w-5 h-5 flex items-center justify-center">
                            {state === "call" ? (
                              isLatestMessage && status !== "ready" ? (
                                <Loader2 className="animate-spin h-4 w-4 text-zinc-500" />
                              ) : (
                                <StopCircle className="h-4 w-4 text-red-500" />
                              )
                            ) : state === "result" ? (
                              <CheckCircle size={14} className="text-green-600" />
                            ) : null}
                          </div>
                        </div>
                        {state === "result" ? (
                          <ul className="flex flex-col gap-1 pl-10">
                            {files.map((f, idx) => (
                              <li key={`${f.path}-${idx}`} className="flex items-center gap-2">
                                {f.error ? (
                                  <span className="text-red-600 text-xs">
                                    {f.name} — {f.error}
                                  </span>
                                ) : (
                                  <>
                                    <a
                                      href={f.url}
                                      download={f.name}
                                      className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700"
                                    >
                                      {f.name}
                                    </a>
                                    <span className="text-xs text-zinc-500">{formatBytes(f.size)}</span>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="flex flex-col gap-1 pl-10 text-xs text-zinc-500">
                            {requestedPaths.map((p, idx) => (
                              <li key={`${p}-${idx}`}>{p}</li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    );
                  }
                  if (toolName === "bash") {
                    const command = args?.command ?? ""

                    return (
                      <motion.div
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        key={`message-${message.id}-part-${i}`}
                        className="flex items-center gap-2 p-2 mb-3 text-sm bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800"
                      >
                        <div className="flex items-center justify-center w-8 h-8 bg-zinc-50 dark:bg-zinc-800 rounded-full">
                          <ScrollText className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex items-baseline gap-2">
                            Running command
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                              {command ? `${command.slice(0, 40)}...` : "..."}
                            </span>
                          </div>
                        </div>
                        <div className="w-5 h-5 flex items-center justify-center">
                          {state === "call" ? (
                            isLatestMessage && status !== "ready" ? (
                              <Loader2 className="animate-spin h-4 w-4 text-zinc-500" />
                            ) : (
                              <StopCircle className="h-4 w-4 text-red-500" />
                            )
                          ) : state === "result" ? (
                            <CheckCircle size={14} className="text-green-600" />
                          ) : null}
                        </div>
                      </motion.div>
                    );
                  }
                  return (
                    <div key={toolCallId}>
                      <h3>
                        {toolName}: {state}
                      </h3>
                      <pre>{JSON.stringify(args, null, 2)}</pre>
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.status !== nextProps.status) return false;
    if (prevProps.message.annotations !== nextProps.message.annotations)
      return false;
    // if (prevProps.message.content !== nextProps.message.content) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

    return true;
  },
);
