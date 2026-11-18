"use client";

import { useRef, useState } from "react";
import { ImagePlus, LockKeyhole, Send, X, CheckCircle2, Sparkles, ArrowDownRight } from "lucide-react";
import { Brand } from "@/components/Brand";
import { ThemeControls } from "@/components/ThemeControls";
import { InstallAppButton } from "@/components/InstallAppButton";
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

  return <main className="relative min-h-screen overflow-hidden bg-[#f2f3f5]">
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-red-100/70 blur-3xl"/>
    <div aria-hidden="true" className="pointer-events-none absolute -left-32 bottom-10 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl"/>
    <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-8">
      <Brand />
      <div className="flex items-center gap-2">
        <ThemeControls />
        <InstallAppButton />
        <a href="/admin" className="inline-flex items-center gap-2 border border-[#d9dee5] bg-white/80 px-4 py-2.5 text-xs font-bold text-[#24344a] transition hover:border-[#e3263d] hover:text-[#e3263d]"><LockKeyhole size={14}/> Admin</a>
      </div>
    </header>

    <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.05fr_.95fr] md:gap-16 md:px-8 md:pb-24 md:pt-14">
      <div className="relative">
        <div className="mb-7 inline-flex items-center gap-2 border-l-[3px] border-[#e3263d] bg-white/70 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#5b6574]"><span className="h-2 w-2 rounded-full bg-[#e3263d]"/> MIVA'S UNOFFICIAL WALL</div>
        <h1 className="max-w-2xl font-black leading-[.94] tracking-[-.065em] text-[#071b36] text-[clamp(3.4rem,8vw,6.6rem)]">No names.<br/><span className="relative inline-block text-[#e3263d]">Just vibes.<span className="absolute -bottom-2 left-1 h-[5px] w-[72%] -rotate-2 bg-[#071b36]"/></span></h1>
        <p className="mt-8 max-w-md text-[15px] leading-7 text-[#626d7d] md:text-base">Confessions, campus gist, hot takes, inside jokes. Drop your thoughts and let them speak for themselves.</p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#26374d]"><span className="grid h-9 w-9 place-items-center border border-[#dce1e7] bg-white"><LockKeyhole size={15}/></span> Private inbox. Anonymous post.</div>
          <span className="hidden h-7 w-px bg-[#d9dee5] sm:block"/>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#e3263d]"><Sparkles size={15}/> Keep it clever. Keep it kind.</div>
        </div>
        <div className="mt-12 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#929aa5] md:flex"><ArrowDownRight size={18}/> Your turn to speak</div>
      </div>

      <div className="relative">
        <div aria-hidden="true" className="absolute -right-3 -top-3 z-0 h-full w-full border-2 border-[#e3263d]"/>
        <div className="relative z-10 border border-[#d9dee5] bg-white p-5 shadow-[0_22px_65px_-38px_rgba(7,27,54,.35)] md:p-7">
          <div className="mb-6 flex items-start justify-between gap-3 border-b border-[#e9ecf0] pb-5">
            <div><div className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#e3263d]">The anonymous drop</div><h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-[#071b36]">What's the gist?</h2><p className="mt-1 text-xs text-[#87909d]">No login. No names. Just say it.</p></div>
            <span className="border border-[#e5e8ed] bg-[#f7f8fa] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[#667184]">100% anon</span>
          </div>
          {sent ? <div className="py-12 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center border-2 border-[#d8efe3] bg-[#f0faf4] text-emerald-600"><CheckCircle2 size={30}/></div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-[#071b36]">You're on the wall.</h2>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#758092]">Your submission has been delivered anonymously. Thanks for adding to the gist.</p>
            <button onClick={() => setSent(false)} className="mt-7 bg-[#071b36] px-6 py-3 text-sm font-bold text-white hover:bg-[#17385e]">Drop another <span aria-hidden="true">↗</span></button>
          </div> : <>
            <form onSubmit={submit}>
              <label htmlFor="message" className="mb-3 block text-[10px] font-extrabold uppercase tracking-[.2em] text-[#687386]">Your message</label>
              <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} rows={7} placeholder="Type it out. Nobody needs to know it's you..." className="w-full resize-none border border-[#e0e4e9] bg-[#f8f9fa] p-4 text-sm leading-7 text-[#17263b] outline-none placeholder:text-[#a0a8b3] focus:border-[#e3263d] focus:ring-4 focus:ring-red-50"/>
              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] text-[#98a0ab]"><span>Be respectful. Keep private details private.</span><span className="shrink-0 font-semibold tabular-nums">{message.length}/2000</span></div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f3] pt-5">
                <div className="min-w-0">
                  <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)}/>
                  <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 border border-[#dfe4e9] px-4 py-2.5 text-xs font-bold text-[#586579] hover:border-[#071b36] hover:text-[#071b36]"><ImagePlus size={15}/> Add image</button>
                  {file && <div className="mt-2 flex max-w-[190px] items-center gap-2 text-xs text-[#667184]"><span className="truncate">{file.name}</span><button type="button" onClick={() => {setFile(null); if(inputRef.current) inputRef.current.value="";}} aria-label="Remove image"><X size={14}/></button></div>}
                </div>
                <button disabled={sending} className="inline-flex items-center gap-3 bg-[#e3263d] px-5 py-3.5 text-xs font-extrabold uppercase tracking-[.08em] text-white shadow-[4px_4px_0_#071b36] transition hover:-translate-y-0.5 hover:bg-[#c91d33] hover:shadow-[5px_6px_0_#071b36] disabled:cursor-not-allowed disabled:opacity-60">{sending ? "Sending..." : "Send anonymously"} <Send size={14}/></button>
              </div>
              {error && <p role="alert" className="mt-4 border-l-2 border-[#e3263d] bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
            </form>
          </>}
        </div>
        <div className="mt-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-[.18em] text-[#929aa5]"><span>MIVA MEMES / EST. FOR THE GROUP CHAT</span><span>01 — DROP IT</span></div>
      </div>
    </section>
    <footer className="relative z-10 border-t border-[#dfe3e8] bg-white/70 px-5 py-6 text-center text-[10px] font-semibold uppercase tracking-[.18em] text-[#8a93a0]">MIVA MEMES <span className="mx-2 text-[#e3263d]">✳</span> Anonymous submissions, privately received.</footer>
  </main>;
}
