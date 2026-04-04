import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: "#0e0e0e",
          color: "#ffffff",
          position: "relative",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 12% -16%, rgba(0,255,255,0.25), transparent 32%), radial-gradient(circle at 92% 110%, rgba(255,107,155,0.2), transparent 40%)"
          }}
        />
        <div style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ color: "#c1fffe", fontSize: 24, letterSpacing: 6, fontWeight: 700 }}>TAPRUSH</div>
          <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: -2 }}>Mind Games</div>
          <div style={{ color: "#cec9ce", fontSize: 28 }}>Beat the cue. Dodge fake-outs. Climb the board.</div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
