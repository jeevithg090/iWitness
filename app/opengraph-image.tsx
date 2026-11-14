import { ImageResponse } from "next/og";

export const alt = "iWitness — Anonymous Incident Reporting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background:
          "radial-gradient(circle at 20% 0%, #0c4a6e 0%, #05070d 60%)",
        color: "#f8fafc",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "linear-gradient(135deg, #38bdf8, #2563eb)",
          }}
        />
        iWitness
      </div>
      <div
        style={{
          marginTop: 48,
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.05,
        }}
      >
        Report incidents.
      </div>
      <div
        style={{
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.05,
          color: "#38bdf8",
        }}
      >
        Protect your identity.
      </div>
      <div style={{ marginTop: 36, fontSize: 30, color: "#94a3b8" }}>
        Anonymous reports · AI-assisted details · Private tracking ID
      </div>
    </div>,
    size,
  );
}
