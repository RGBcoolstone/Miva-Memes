"use client";

import { useState } from "react";
import { Share2, Download, LoaderCircle } from "lucide-react";

type Props = { message: string; imageUrl?: string; fileName?: string };

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function makeShareImage(message: string, imageUrl?: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create the share image.");
  ctx.fillStyle = "#061a38"; ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = "#f3263d"; ctx.fillRect(0, 0, 1080, 18);
  ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 3;
  roundedRect(ctx, 42, 42, 996, 1266, 42); ctx.stroke();

  ctx.fillStyle = "#ffffff"; ctx.font = "bold 54px Arial";
  ctx.fillText("MIVA", 86, 145);
  ctx.fillStyle = "#c7d0dd"; ctx.font = "bold 22px Arial";
  ctx.fillText("MEMES  /  ANONYMOUS BOX", 88, 188);
  ctx.fillStyle = "#f3263d"; ctx.fillRect(88, 225, 110, 8);

  let cursorY = 315;
  if (imageUrl) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Image unavailable");
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve(); img.onerror = () => reject(new Error("Could not load attachment."));
        img.src = localUrl;
      });
      const maxW = 820, maxH = 520, scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale, h = img.height * scale;
      const x = (1080 - w) / 2;
      ctx.save(); roundedRect(ctx, x, cursorY, w, h, 24); ctx.clip(); ctx.drawImage(img, x, cursorY, w, h); ctx.restore();
      cursorY += h + 58;
      URL.revokeObjectURL(localUrl);
    } catch { /* Text card can still be shared if the attachment cannot be embedded. */ }
  }
  const cleanMessage = message.trim() || "A picture was shared anonymously.";
  ctx.fillStyle = "#ffffff"; ctx.font = "42px Arial";
  const lines = wrapText(ctx, cleanMessage, 820);
  const maxLines = Math.max(1, Math.floor((1120 - cursorY) / 58));
  lines.slice(0, maxLines).forEach((line, index) => ctx.fillText(line, 88, cursorY + index * 58));
  if (lines.length > maxLines) {
    ctx.fillStyle = "#c7d0dd"; ctx.font = "28px Arial";
    ctx.fillText("…", 88, cursorY + maxLines * 58);
  }
  ctx.fillStyle = "#c7d0dd"; ctx.font = "bold 22px Arial";
  ctx.fillText("SHARED FROM THE MIVA MEMES ANONYMOUS BOX", 88, 1218);
  ctx.fillStyle = "#f3263d"; ctx.fillRect(88, 1248, 904, 5);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Could not export the share image.")), "image/png"));
}

export function ShareSubmissionButton({ message, imageUrl }: Props) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  async function share() {
    setBusy(true); setStatus("");
    try {
      const blob = await makeShareImage(message, imageUrl);
      const file = new File([blob], "miva-memes-anonymous.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "MIVA Memes — Anonymous", text: "An anonymous MIVA Memes submission", files: [file] });
        setStatus("Share sheet opened.");
      } else {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url; anchor.download = file.name; anchor.click();
        URL.revokeObjectURL(url);
        setStatus("Image downloaded. You can now share it.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setStatus(error instanceof Error ? error.message : "Could not create share image.");
    } finally { setBusy(false); }
  }
  return <div className="flex flex-wrap items-center gap-2">
    <button type="button" disabled={busy} onClick={share} className="inline-flex items-center gap-2 rounded-full bg-[#f3263d] px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
      {busy ? <LoaderCircle size={13} className="animate-spin"/> : <Share2 size={13}/>}
      {busy ? "Preparing..." : "Create & share image"}
    </button>
    {status && <span role="status" className="text-[11px] text-slate-500">{status}</span>}
  </div>;
}
