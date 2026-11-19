"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, RefreshCw, Vote } from "lucide-react";
import { Brand } from "@/components/Brand";
import { supabase, supabaseReady } from "@/lib/supabase";

type Poll={id:string;slug:string;prompt:string;created_at:string};
type Option={id:string;label:string};
type Total={poll_id:string;option_id:string;vote_count:number};
export default function PollDetailPage(){
  const params=useParams<{slug:string}>();
  const [poll,setPoll]=useState<Poll|null>(null);
  const [options,setOptions]=useState<Option[]>([]);
  const [totals,setTotals]=useState<Total[]>([]);
  const [selected,setSelected]=useState("");
  const [voterKey,setVoterKey]=useState("");
  const [hasVoted,setHasVoted]=useState(false);
  const [loading,setLoading]=useState(true);
  const [voting,setVoting]=useState(false);
  const [error,setError]=useState("");

  async function load(pollId?:string){
    if(!supabase){setLoading(false);return;}
    let id=pollId;
    if(!id){
      const found=await supabase.from("polls").select("id,slug,prompt,created_at").eq("slug",params.slug).maybeSingle();
      if(found.error){setError(found.error.message);setLoading(false);return;}
      if(!found.data){setError("This poll could not be found.");setLoading(false);return;}
      setPoll(found.data as Poll); id=found.data.id;
    }
    const [o,t]=await Promise.all([
      supabase.from("poll_options").select("id,label").eq("poll_id",id).order("created_at",{ascending:true}),
      supabase.from("poll_vote_totals").select("poll_id,option_id,vote_count").eq("poll_id",id)
    ]);
    if(o.error||t.error)setError(o.error?.message||t.error?.message||"Couldn't load poll results.");
    else {setOptions((o.data||[]) as Option[]);setTotals((t.data||[]) as Total[]);}
    setLoading(false);
  }
  useEffect(()=>{
    let key=localStorage.getItem("miva-poll-voter-key");
    if(!key){key=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem("miva-poll-voter-key",key);}
    setVoterKey(key);
    const voted=localStorage.getItem("miva-poll-voted-"+params.slug)==="yes";
    setHasVoted(voted);
    void load();
  },[params.slug]);

  const totalVotes=totals.reduce((sum,x)=>sum+Number(x.vote_count),0);
  async function vote(){
    setError("");
    if(!supabase||!poll||!selected||!voterKey)return;
    setVoting(true);
    const {error}=await supabase.rpc("cast_poll_vote",{p_poll_id:poll.id,p_option_id:selected,p_voter_key:voterKey});
    if(error)setError(error.message);
    else {localStorage.setItem("miva-poll-voted-"+params.slug,"yes");setHasVoted(true);await load(poll.id);}
    setVoting(false);
  }

  return <main className="min-h-screen bg-[#f4f6fa] px-5 pb-16">
    <header className="mx-auto flex max-w-4xl items-center justify-between gap-3 py-6"><a href="/"><Brand/></a><a href="/polls" className="text-xs font-semibold text-slate-500">All polls</a></header>
    <div className="mx-auto max-w-2xl">
      <a href="/polls" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500"><ArrowLeft size={14}/> Back to polls</a>
      {loading?<p className="py-20 text-center text-sm text-slate-500">Loading poll...</p>:!poll?<div className="mt-5 rounded-3xl bg-white p-8 text-center text-sm text-slate-500">{error||"Poll not found."}</div>:<div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f3263d]">MIVA Poll · Anonymous voting</p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[#061a38]">{poll.prompt}</h1>
        <p className="mt-3 text-xs text-slate-400">{totalVotes} {totalVotes===1?"vote":"votes"} recorded</p>
        {!hasVoted?<div className="mt-7 space-y-3">{options.map(o=><label key={o.id} className={"flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition "+(selected===o.id?"border-[#f3263d] bg-red-50":"border-slate-200 bg-[#fafbfc]")}><input type="radio" name="poll-option" checked={selected===o.id} onChange={()=>setSelected(o.id)} className="accent-[#f3263d]"/><span className="text-sm font-semibold text-[#061a38]">{o.label}</span></label>)}<button onClick={vote} disabled={!selected||voting||!supabaseReady} className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#f3263d] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{voting?"Submitting...":"Submit vote"}<Vote size={15}/></button></div>:<div className="mt-7 rounded-2xl bg-emerald-50 p-4"><div className="flex items-center gap-2 font-bold text-emerald-800"><CheckCircle2 size={18}/> Thanks for voting!</div><p className="mt-1 text-xs text-emerald-700">Here are the current community results.</p></div>}
        <div className="mt-8 border-t border-slate-100 pt-6"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-[#061a38]">Poll results</h2><button onClick={()=>void load(poll.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><RefreshCw size={13}/> Refresh</button></div><div className="mt-4 space-y-4">{options.map(o=>{const count=Number(totals.find(t=>t.option_id===o.id)?.vote_count||0);const pct=totalVotes?Math.round(count/totalVotes*100):0;return <div key={o.id}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-700">{o.label}</span><span className="shrink-0 text-xs text-slate-500">{pct}% · {count}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#f3263d] transition-all" style={{width:pct+"%"}}/></div></div>})}</div><p className="mt-4 text-[11px] text-slate-400">Results update when refreshed. One vote per browser is enforced using a browser token.</p></div>
        {error&&<p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      </div>}
    </div>
  </main>;
}
