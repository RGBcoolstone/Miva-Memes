"use client";

import { useRef, useState } from "react";
import { ImagePlus, LockKeyhole, Send, X, CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/Brand";
import { supabase, supabaseReady } from "@/lib/supabase";

export default function Home() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!message.trim() && !file) { setError("Write a message or attach an image first."); return; }
    if (!supabaseReady || !supabase) { setError("The submission box is not connected yet. Ask the site admin to finish setup."); return; }
    if (message.length > 2000) { setError("Keep your message under 2,000 characters."); return; }
    if (file && (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) {
      setError("Choose an image under 5 MB."); return;
    }
    setSending(true);
    try {
      let imagePath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
        const path = `${crypto.randomUUID()}.${safeExt}`;
        const { error: uploadError } = await supabase.storage.from("submissions").upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        imagePath = path;
      }
      const { error: insertError } = await supabase.from("submissions").insert({ message: message.trim(), image_path: imagePath });
      if (insertError) throw insertError;
      setSent(true); setMessage(""); setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally { setSending(false); }
  }

  return <main className="min-h-screen bg-[#f4f6fa]">
    <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
      <Brand />
      <a href="/admin" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"><LockKeyhole size={14}/> Admin</a>
    </header>

    <section className="mx-auto grid max-w-5xl items-center gap-12 px-5 pb-20 pt-8 md:grid-cols-[1fr_1fr] md:pt-16">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#d91e35]"><span className="h-2 w-2 rounded-full bg-[#f3263d]"/> YOUR MIVA ANONYMOUS BOX</div>
        <h1 className="max-w-xl text-5xl font-extrabold leading-[1.06] tracking-tight text-[#061a38] md:text-6xl">Say it.<br/><span className="text-[#f3263d]">No names.</span><br/>No pressure.</h1>
        <p className="mt-6 max-w-md text-base leading-7 text-slate-600">Got a confession, a funny thought, a meme or something you want to get off your chest? Drop it here. Keep it anonymous.</p>
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-500"><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#061a38] shadow-sm"><LockKeyhole size={16}/></span><span>Submissions go to the private MIVA Memes inbox.</span></div>
      </div>

      <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-soft md:p-7">
        {sent ? <div className="py-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={32}/></div>
          <h2 className="mt-5 text-2xl font-bold text-[#061a38]">Message sent!</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">Your submission has been delivered anonymously. Thanks for sharing.</p>
          <button onClick={() => setSent(false)} className="mt-7 rounded-full bg-[#061a38] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102b52]">Send another</button>
        </div> : <>
          <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-[#061a38]">Send a message</h2><p className="mt-1 text-xs text-slate-500">Your identity is not requested.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Anonymous</span></div>
          <form onSubmit={submit}>
            <label htmlFor="message" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Your message</label>
            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} rows={6} placeholder="Type whatever is on your mind..." className="w-full resize-none rounded-2xl border border-slate-200 bg-[#fafbfc] p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#f3263d] focus:ring-4 focus:ring-red-50"/>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400"><span>Be respectful. Don't share anyone's private information.</span><span>{message.length}/2000</span></div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/>
                <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"><ImagePlus size={15}/> Add image</button>
                {file && <div className="mt-2 flex max-w-[190px] items-center gap-2 text-xs text-slate-500"><span className="truncate">{file.name}</span><button type="button" onClick={() => {setFile(null); if(inputRef.current) inputRef.current.value="";}} aria-label="Remove image"><X size={14}/></button></div>}
              </div>
              <button disabled={sending} className="inline-flex items-center gap-2 rounded-full bg-[#f3263d] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-[#dc1d34] disabled:cursor-not-allowed disabled:opacity-60">{sending ? "Sending..." : "Send anonymously"} <Send size={15}/></button>
            </div>
            {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
          </form>
        </>}
      </div>
    </section>
    <footer className="border-t border-slate-200 bg-white/70 px-5 py-6 text-center text-xs text-slate-400">MIVA MEMES · Anonymous submissions, privately received.</footer>
  </main>;
}
