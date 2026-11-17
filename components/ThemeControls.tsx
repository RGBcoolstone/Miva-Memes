"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Contrast } from "lucide-react";

type Theme = "light" | "dark" | "mono";
const themes: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light mode", Icon: Sun },
  { value: "dark", label: "Dark mode", Icon: Moon },
  { value: "mono", label: "Black and white mode", Icon: Contrast }
];

export function ThemeControls() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("miva-theme") as Theme | null;
    const selected = saved && ["light", "dark", "mono"].includes(saved) ? saved : "light";
    setTheme(selected);
    document.documentElement.dataset.theme = selected;
  }, []);

  function changeTheme(next: Theme) {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("miva-theme", next);
  }

  return <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1" aria-label="Choose appearance">
    {themes.map(({ value, label, Icon }) => <button key={value} type="button" onClick={() => changeTheme(value)} aria-label={label} aria-pressed={theme === value} title={label} className={`grid h-8 w-8 place-items-center rounded-full transition ${theme === value ? "bg-[#061a38] text-white" : "text-slate-500 hover:bg-slate-100"}`}>
      <Icon size={15}/>
    </button>)}
  </div>;
}
