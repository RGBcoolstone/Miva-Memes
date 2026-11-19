"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function MaintenanceGate() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!supabase || pathname.startsWith("/admin")) return;
    let active = true;
    const load = async () => {
      const { data } = await supabase!.from("site_settings").select("maintenance_mode").eq("id", true).maybeSingle();
      if (active && typeof data?.maintenance_mode === "boolean") setEnabled(data.maintenance_mode);
    };
    load();
    const channel = supabase.channel("public-maintenance-status").on("postgres_changes", {
      event: "UPDATE", schema: "public", table: "site_settings"
    }, payload => {
      if (active && typeof payload.new.maintenance_mode === "boolean") setEnabled(payload.new.maintenance_mode);
    }).subscribe();
    const refresh = window.setInterval(load, 30000);
    return () => {
      active = false;
      window.clearInterval(refresh);
      void supabase.removeChannel(channel);
    };
  }, [pathname]);

  if (!enabled || pathname.startsWith("/admin")) return null;

  return <div role="alert" aria-live="polite" className="fixed inset-0 z-[9999] grid min-h-screen place-items-center overflow-y-auto bg-[#020817] p-3 sm:p-6">
    <div className="w-full max-w-5xl text-center">
      <img src="/maintenance.svg" alt="Site currently undergoing maintenance. Please check back later." className="mx-auto h-auto w-full rounded-2xl shadow-2xl shadow-blue-950/40" />
    </div>
  </div>;
}
