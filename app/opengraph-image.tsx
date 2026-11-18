import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MIVA Memes — Say it. No names. No pressure.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#061a38", color: "white", fontFamily: "Arial" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: "#f3263d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900 }}>M</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: 8 }}>MIVA</span>
          <span style={{ fontSize: 14, letterSpacing: 7, color: "#c7d0dd" }}>MEMES</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1 }}>Say it.</div>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1, color: "#f3263d" }}>No names.</div>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1 }}>No pressure.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 22, color: "#c7d0dd" }}>
        <span>YOUR MIVA ANONYMOUS BOX</span>
        <span style={{ background: "#f3263d", color: "white", padding: "12px 22px", borderRadius: 30, fontWeight: 700 }}>SHHH — IT'S ANONYMOUS</span>
      </div>
    </div>,
    { ...size }
  );
}
