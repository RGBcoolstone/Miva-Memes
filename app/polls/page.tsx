"use client";

import { FormEvent, useEffect, useState } from "react";
import { Copy, Plus, Vote, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/Brand";
import { ThemeControls } from "@/components/ThemeControls";
import { InstallAppButton } from "@/components/InstallAppButton";
import { supabase, supabaseReady } from "@/lib/supabase";

type Poll = { id: string; slug: string; prompt: string; created_at: string };
export default function PollsPage() {
  const [prompt,setPrompt]=useState("");
  const [options,setOptions]=useState(["",""]);
  const [items,setItems]=useState<Poll[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [created,setCreated]=useState("");

  async function load() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const {data,error}=await supabase.from("polls").select("id,slug,prompt,created_at").order("created_at",{ascending:false}).limit(50);
    if(error)setError(error.message); else setItems((data||[]) as Poll[]);
    setLoading(false);
  }
  useEffect(()=>{void load();},[]);

  async function create(e:FormEvent) {
    e.preventDefault(); setError(""); setCreated("");
    const clean=options.map(x=>x.trim()).filter(Boolean);
    if(prompt.trim().length<3){setError("Write a poll question with at least 3 characters.");return;}
    if(clean.length<2||clean.length>8){setError("Add between 2 and 8 answer options.");return;}
    if(new Set(clean.map(x=>x.toLowerCase())).size!==clean.length){setError("Each answer option must be different.");return;}
    if(!supabase){setError("Database connection is unavailable.");return;}
    setSaving(true);
    const {data,error}=await supabase.rpc("create_poll",{p_prompt:prompt.trim(),p_options:clean});
    if(error)setError(error.message);
    else {
      const poll=Array.isArray(data)?data[0]:data;
      if(poll){setItems(old=>[poll as Poll,...old]);setCreated(location.origin+"/poll/"+poll.slug);setPrompt("");setOptions(["",""]);}
      else setError("The poll was created, but its link could not be generated. Refresh the page.");
    }
    setSaving(false);
  }
  async function copy(url:string){try{await navigator.clipboard.writeText(url);}catch{setError("Couldn't copy automatically. You can select and copy the link.");}}

  return <main className="min-h-screen bg-[#f4f6fa] px-5 pb-16">
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 py-6"><a href="/"><Brand/></a><nav className="flex flex-wrap items-center gap-2"><a href="/questions" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">Questions</a><a href="/notifications" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600">Notifications</a><ThemeControls/><InstallAppButton/></nav></header>
    <div className="mx-auto max-w-4xl">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f3263d]">MIVA Polls</p>
      <h1 className="mt-2 text-4xl font-extrabold text-[#061a38] md:text-5xl">Let the community decide.</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Create a poll, share its unique link, and collect anonymous votes from the MIVA community.</p>
      <form onSubmit={create} className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft md:p-7">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Poll question</label>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={240} rows={2} placeholder="What's the best thing about MIVA?" className="w-full resize-none rounded-2xl border border-slate-200 bg-[#fafbfc] p-4 text-sm outline-none focus:border-[#f3263d]"/>
        <div className="mt-5 flex items-center justify-between"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Answer options</label><span className="text-xs text-slate-400">{options.length}/8</span></div>
        <div className="mt-3 space-y-2">{options.map((option,i)=><div key={i} className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#061a38] text-xs font-bold text-white">{String.fromCharCode(65+i)}</span><input value={option} onChange={e=>setOptions(old=>old.map((v,j)=>j===i?e.target.value:v))} maxLength={120} placeholder={"Option "+(i+1)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-[#fafbfc] px-4 py-3 text-sm outline-none focus:border-[#f3263d]"/>{options.length>2&&<button type="button" onClick={()=>setOptions(old=>old.filter((_,j)=>j!==i))} aria-label={"Remove option "+(i+1)} className="rounded-full px-3 py-2 text-sm text-slate-400 hover:bg-red-50 hover:text-red-600">×</button>}</div>)}</div>
        <button type="button" disabled={options.length>=8} onClick={()=>setOptions(old=>[...old,""])} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#f3263d] disabled:opacity-40"><Plus size={14}/> Add option</button>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-400">2–8 options · Anonymous voting</span><button disabled={saving||!supabaseReady} className="inline-flex items-center gap-2 rounded-full bg-[#f3263d] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{saving?"Creating...":"Create poll"}<Vote size={15}/></button></div>
        {error&&<p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        {created&&<div className="mt-4 rounded-2xl bg-emerald-50 p-4"><p className="text-sm font-bold text-emerald-800">Your poll is live!</p><p className="mt-1 break-all text-xs text-emerald-700">{created}</p><button type="button" onClick={()=>copy(created)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-bold text-white"><Copy size={14}/> Copy poll link</button></div>}
      </form>
      <div className="mt-10 flex items-center justify-between"><h2 className="text-xl font-bold text-[#061a38]">Recent polls</h2><span className="text-xs text-slate-400">{items.length} shown</span></div>
      {loading?<p className="py-10 text-center text-sm text-slate-500">Loading polls...</p>:items.length===0?<p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No polls yet. Create the first one.</p>:<div className="mt-4 grid gap-3 md:grid-cols-2">{items.map(p=><a key={p.id} href={"/poll/"+p.slug} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center gap-2 text-xs font-semibold text-[#f3263d]"><Vote size={14}/> COMMUNITY POLL</div><h3 className="mt-3 text-lg font-bold text-[#061a38]">{p.prompt}</h3><div className="mt-5 flex items-center justify-between text-xs text-slate-400"><span>Vote and view results</span><ArrowUpRight size={16} className="group-hover:text-[#f3263d]"/></div></a>)}</div>}
    </div>
  </main>;
}
