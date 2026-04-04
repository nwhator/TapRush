import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
              "radial-gradient(circle at 10% -20%, rgba(0,255,255,0.28), transparent 35%), radial-gradient(circle at 95% 120%, rgba(255,107,155,0.25), transparent 40%)"
          }}
        />

        <div
          style={{
            margin: "auto",
            width: 1000,
            height: 430,
            borderRadius: 42,
            background: "rgba(20, 20, 20, 0.92)",
            border: "1px solid rgba(193,255,254,0.18)",
            boxShadow: "0 0 50px rgba(0,255,255,0.24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "64px 76px"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ color: "#c1fffe", fontSize: 24, letterSpacing: 6, fontWeight: 700 }}>MIND GAMES</div>
            <div style={{ fontSize: 82, fontWeight: 900, letterSpacing: -2 }}>TAPRUSH</div>
            <div style={{ color: "#c7c3c7", fontSize: 30 }}>Infinite reaction levels. Live leaderboards.</div>
          </div>

          <div
            style={{
              width: 230,
              height: 230,
              borderRadius: 40,
              background: "linear-gradient(135deg, #00ffff, #ff6b9b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(0,255,255,0.32)"
            }}
          >
            <div
              style={{
                width: 190,
                height: 190,
                borderRadius: 32,
                background: "#0e0e0e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c1fffe",
                fontSize: 84,
                fontWeight: 900
              }}
            >
              TR
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
