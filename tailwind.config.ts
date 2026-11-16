import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { navy: "#061a38", red: "#f3263d", mist: "#f4f6fa" }, boxShadow: { soft: "0 18px 60px rgba(6,26,56,.10)" } } },
  plugins: []
};
export default config;
