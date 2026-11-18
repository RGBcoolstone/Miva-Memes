"use client";

import { useEffect, useState } from "react";
import { Brand } from "@/components/Brand";

const TARGET = "Shhh- it's anonymous";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?@#$%";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState(TARGET);
  useEffect(() => {
    if (sessionStorage.getItem("miva-splash-seen") === "yes") return;
    setVisible(true);
    let frame = 0;
    const total = 24;
    const interval = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor((frame / total) * TARGET.length);
      const scrambled = TARGET.split("").map((char, index) => {
        if (char === " " || index < revealed) return char;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join("");
      setLabel(frame >= total ? TARGET : scrambled);
      if (frame >= total) window.clearInterval(interval);
    }, 55);
    const close = window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("miva-splash-seen", "yes");
    }, 2350);
    return () => { window.clearInterval(interval); window.clearTimeout(close); };
  }, []);
  if (!visible) return null;
  return <div className="miva-splash" role="status" aria-label="Loading MIVA Memes">
    <div className="miva-splash-content">
      <Brand/>
      <p className="miva-splash-whisper" aria-live="polite">{label}</p>
      <div className="miva-loading-track"><span/></div>
      <span className="miva-splash-caption">A little mystery. A lot of MIVA.</span>
    </div>
  </div>;
}
