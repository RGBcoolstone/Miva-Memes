export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3">
    <div className="relative grid h-11 w-11 place-items-center overflow-hidden bg-[#071b36]">
      <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
        <path d="M5 7 24 22 43 7 38 42 24 27 10 42Z" fill="#fff"/>
        <path d="M8 7 24 20 40 7 24 36Z" fill="#e3263d"/>
        <path d="M11 6 24 16 37 6 24 22Z" fill="#b9c0ca"/>
      </svg>
    </div>
    <div>
      <div className="font-serif text-xl font-black tracking-[.18em] text-[#071b36]">MIVA</div>
      {!compact && <div className="text-[10px] font-semibold tracking-[.32em] text-slate-500">— MEMES —</div>}
    </div>
  </div>;
}
