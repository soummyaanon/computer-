import { Sandbox } from "@e2b/desktop";
import path from "node:path";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sandboxId = url.searchParams.get("sandboxId");
  const filePath = url.searchParams.get("path");

  if (!sandboxId || !filePath) {
    return new Response("sandboxId and path are required", { status: 400 });
  }

  try {
    const desktop = await Sandbox.connect(sandboxId);
    const running = await desktop.isRunning();
    if (!running) {
      return new Response("Sandbox is not running", { status: 410 });
    }

    const bytes = (await desktop.files.read(filePath, { format: "bytes" })) as Uint8Array;
    const filename = path.basename(filePath) || "download";
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === ".pdf" ? "application/pdf" :
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      ext === ".zip" ? "application/zip" :
      ext === ".txt" ? "text/plain" :
      "application/octet-stream";

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("sandbox-file error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`Failed to read file: ${message}`, { status: 500 });
  }
}
