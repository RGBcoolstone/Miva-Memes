export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3">
    <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-[#061a38]">
      <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true">
        <path d="M5 7 24 22 43 7 38 42 24 27 10 42Z" fill="#fff"/>
        <path d="M8 7 24 20 40 7 24 36Z" fill="#f3263d"/>
        <path d="M11 6 24 16 37 6 24 22Z" fill="#b9c0ca"/>
      </svg>
    </div>
    <div>
      <div className="font-serif text-xl font-bold tracking-[.22em] text-[#061a38]">MIVA</div>
      {!compact && <div className="text-[10px] tracking-[.35em] text-slate-500">— MEMES —</div>}
    </div>
  </div>;
}
