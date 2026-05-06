import { openai } from "@ai-sdk/openai";
import { streamText, UIMessage } from "ai";
import { killDesktop } from "@/lib/e2b/utils";
import { bashTool, computerTool, downloadTool } from "@/lib/e2b/tool";
import { prunedMessages } from "@/lib/utils";

// Allow streaming responses up to 30 seconds
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages, sandboxId }: { messages: UIMessage[]; sandboxId: string } =
    await req.json();
  try {
    const result = streamText({
      model: openai("gpt-5.2"),
      system:
        "You are an execution-first assistant with access to a sandbox desktop.\n" +
        "When the user asks for an action, do it directly using tools and keep going until complete.\n" +
        "Use the computer tool for screenshot/click/rightClick/doubleClick/middleClick/type/key/hotkey/scroll/move/drag/wait/open.\n" +
        "Use the bash tool to run commands, create/edit files, install packages, and debug.\n" +
        "When you need to see the screen, call computer with action=screenshot.\n" +
        "Prefer bash when possible. Keep going until the task is done.\n" +
        "Ask follow-up questions only when absolutely necessary to proceed safely.\n" +
        "Be explicit when waiting is required.\n" +
        "If the browser opens with a setup wizard, YOU MUST IGNORE IT and move straight to the next step (e.g. input the url in the search bar).\n" +
        "When you save or download a file inside the sandbox that the user should receive (e.g. patient documents, PDFs, images), call the `download` tool with the absolute file path(s) so the user gets clickable links in the chat. Default browser downloads land in /root/Downloads or /home/user/Downloads.",
      messages: prunedMessages(messages),
      tools: {
        computer: computerTool(sandboxId),
        bash: bashTool(sandboxId),
        download: downloadTool(sandboxId),
      },
      toolCallStreaming: true,
    });

    // Create response stream
    const response = result.toDataStreamResponse({
      getErrorMessage(error: unknown) {
        console.error(error);
        if (error == null) return "Unknown error";
        if (typeof error === "string") return error;
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    });

    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    await killDesktop(sandboxId); // Force cleanup on error
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
