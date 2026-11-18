"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, LogOut, RefreshCw, Trash2, Image as ImageIcon, Inbox, Eye, EyeOff } from "lucide-react";
import { Brand } from "@/components/Brand";
import { ThemeControls } from "@/components/ThemeControls";
import { InstallAppButton } from "@/components/InstallAppButton";
import { ShareSubmissionButton } from "@/components/ShareSubmissionButton";
import { supabase, supabaseReady } from "@/lib/supabase";

type Submission = { id: string; message: string; image_path: string | null; created_at: string };

export default function AdminPage() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [loggedIn,setLoggedIn]=useState(false);
  const [items,setItems]=useState<Submission[]>([]);
  const [urls,setUrls]=useState<Record<string,string>>({});
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function load() {
    if(!supabase)return;
    setLoading(true);setError("");
    const {data,error:queryError}=await supabase.from("submissions").select("id,message,image_path,created_at").order("created_at",{ascending:false});
    if(queryError)setError(queryError.message);
    else {
      const rows=(data||[]) as Submission[];setItems(rows);
      const signed:Record<string,string>={};
      for(const row of rows) if(row.image_path) {
        const {data:imageData,error:imageError}=await supabase.storage.from("submissions").createSignedUrl(row.image_path,600);
        if(imageError) console.error("Could not sign submission image:",imageError.message);
        if(imageData?.signedUrl)signed[row.id]=imageData.signedUrl;
      }
      setUrls(signed);
    }
    setLoading(false);
  }

  async function verifyAdmin() {
    if(!supabase)return;
    const {data}=await supabase.auth.getSession();
    const session=data.session;
    if(!session)return;
    if(session.user.app_metadata?.role!=="admin") {
      await supabase.auth.signOut();setError("This account does not have administrator access.");return;
    }
    setLoggedIn(true);load();
  }
  useEffect(()=>{verifyAdmin();},[]);

  async function login(e:React.FormEvent) {
    e.preventDefault();setError("");
    if(!supabase)return;
    const {error:authError}=await supabase.auth.signInWithPassword({email,password});
    if(authError){setError(authError.message);return;}
    const {data}=await supabase.auth.getSession();
    if(data.session?.user.app_metadata?.role!=="admin") {
      await supabase.auth.signOut();setError("This account is not an administrator. Ask the site owner to grant admin access.");return;
    }
    setPassword("");setLoggedIn(true);load();
  }
  async function logout(){await supabase?.auth.signOut();setLoggedIn(false);setItems([]);setUrls({});}
  async function remove(id:string) {
    if(!supabase||!confirm("Permanently delete this submission?"))return;
    const row=items.find(x=>x.id===id);
    const {error:deleteError}=await supabase.from("submissions").delete().eq("id",id);
    if(deleteError){setError(deleteError.message);return;}
    if(row?.image_path)await supabase.storage.from("submissions").remove([row.image_path]);
    setItems(old=>old.filter(x=>x.id!==id));
  }
  async function copy(item:Submission){await navigator.clipboard.writeText(item.message||"Image submission");}

  if(!supabaseReady)return <Shell><Notice>Connect Supabase first by adding your environment variables.</Notice></Shell>;
  return <Shell>
    {!loggedIn?<div className="mx-auto mt-14 max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#061a38] text-white"><LockKeyhole/></div>
      <h1 className="text-2xl font-bold text-[#061a38]">Admin sign in</h1><p className="mt-2 text-sm text-slate-500">Private access to the MIVA Memes inbox.</p>
      <form onSubmit={login} className="mt-7 space-y-4">
        <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin email" autoComplete="username" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#f3263d]"/>
        <div className="relative">
          <input required type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-[#f3263d]"/>
          <button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?"Hide password":"Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-3 grid place-items-center text-slate-500 hover:text-[#f3263d]">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>
        </div>
        <button className="w-full rounded-xl bg-[#061a38] px-4 py-3 text-sm font-bold text-white hover:bg-[#102b52]">Sign in</button>
      </form>{error&&<Notice>{error}</Notice>}
    </div>:<>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#f3263d]">Private control room</p><h1 className="mt-2 text-3xl font-extrabold text-[#061a38]">Your inbox</h1><p className="mt-1 text-sm text-slate-500">{items.length} submission{items.length===1?"":"s"}</p></div><div className="flex gap-2"><button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold"><RefreshCw size={14}/> Refresh</button><button onClick={logout} className="inline-flex items-center gap-2 rounded-full bg-[#061a38] px-4 py-2 text-xs font-semibold text-white"><LogOut size={14}/> Sign out</button></div></div>
      {error&&<Notice>{error}</Notice>}
      {loading?<p className="py-16 text-center text-sm text-slate-500">Loading inbox...</p>:items.length===0?<div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Inbox className="mx-auto text-slate-300" size={36}/><h2 className="mt-4 font-bold text-[#061a38]">Your inbox is empty</h2><p className="mt-1 text-sm text-slate-500">New anonymous submissions will appear here.</p></div>:
      <div className="grid gap-4 md:grid-cols-2">{items.map(item=><article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400"><span>ANONYMOUS SUBMISSION</span><time>{new Date(item.created_at).toLocaleString()}</time></div>
        {item.message&&<p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.message}</p>}
        {urls[item.id]&&<a href={urls[item.id]} target="_blank" rel="noreferrer" className="mt-4 block overflow-hidden rounded-xl bg-slate-100"><img src={urls[item.id]} alt="Submitted attachment" className="max-h-80 w-full object-contain"/></a>}
        {item.image_path&&!urls[item.id]&&<p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><ImageIcon size={14}/> Image attached</p>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <ShareSubmissionButton message={item.message} imageUrl={urls[item.id]}/>
          <div className="flex gap-2">
            <button onClick={()=>copy(item)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Copy text</button>
            <button onClick={()=>remove(item.id)} className="inline-flex items-center gap-2 rounded-full border border-red-100 px-3 py-2 text-xs font-semibold text-red-600"><Trash2 size={13}/> Delete</button>
          </div>
        </div>
      </article>)}</div>}
    </>}
  </Shell>;
}
function Shell({children}:{children:React.ReactNode}) {
  return <main className="min-h-screen bg-[#f4f6fa] px-5 pb-16"><header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 py-6"><a href="/"><Brand/></a><div className="flex items-center gap-2"><ThemeControls/><InstallAppButton/><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin</span></div></header><div className="mx-auto max-w-5xl">{children}</div></main>;
}
function Notice({children}:{children:React.ReactNode}){return <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{children}</p>;}
