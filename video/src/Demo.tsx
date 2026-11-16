import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";

const { fontFamily } = loadFont("normal", { weights: ["500", "800"] });

export const FPS = 30;
export const DURATION = 900;

const ACCENT = "#C2451E";
const BG = "#0A0A0A";

type Shot = { file: string; from: number; to: number };
type Beat = { from: number; to: number; caption: string; sub: string };

// Each shot fades in over FADE frames at `from` and out at `to`.
const SHOTS: Shot[] = [
  { file: "02-today", from: 75, to: 225 },
  { file: "03-work", from: 225, to: 300 },
  { file: "03b-tickets", from: 300, to: 375 },
  { file: "21-deliveries", from: 375, to: 495 },
  { file: "20-scratch", from: 495, to: 615 },
  { file: "04-finance", from: 615, to: 675 },
  { file: "32-expenses", from: 675, to: 735 },
  { file: "40-staff", from: 735, to: 825 },
];

const BEATS: Beat[] = [
  { from: 75, to: 225, caption: "One view of the whole day", sub: "Day close, quick actions, what needs you" },
  { from: 225, to: 375, caption: "Assign work. Track issues.", sub: "Tasks and tickets for the whole team" },
  { from: 375, to: 495, caption: "Check deliveries in", sub: "Suppliers, bills and what you still owe" },
  { from: 495, to: 615, caption: "Scratch cards, sorted", sub: "Packs, scans and sales per game" },
  { from: 615, to: 735, caption: "Know where the money went", sub: "Finance, till and expenses" },
  { from: 735, to: 825, caption: "See who is on shift", sub: "Staff progress at a glance" },
];

const FADE = 12;
const PHONE_IN = 50;
const PHONE_OUT = 825;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Caption = ({ beat }: { beat: Beat }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [beat.from, beat.from + 14], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const outP = interpolate(frame, [beat.to - 10, beat.to], [1, 0], clamp);
  const o = Math.min(inP, outP);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: 96,
        opacity: o,
        transform: `translateY(${(1 - inP) * 24}px)`,
        fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 44,
            height: 12,
            background: ACCENT,
            transform: "rotate(-28deg)",
          }}
        />
        <div style={{ color: "#fff", fontSize: 64, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>
          {beat.caption}
        </div>
      </div>
      <div style={{ color: "#8d8d8d", fontSize: 30, fontWeight: 500, marginTop: 14, marginLeft: 62 }}>
        {beat.sub}
      </div>
    </div>
  );
};

const Phone = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - PHONE_IN, fps, config: { damping: 18, stiffness: 90 } });
  const exit = interpolate(frame, [PHONE_OUT, PHONE_OUT + 25], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });
  const y = interpolate(enter, [0, 1], [1200, 0]) + exit * 1200;
  const float = Math.sin(frame / 34) * 6;
  const W = 500;
  const H = (W * 2400) / 1080;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - W - 28) / 2,
        top: 260,
        width: W + 28,
        height: H + 28,
        borderRadius: 74,
        background: "#1b1b1d",
        padding: 14,
        boxSizing: "border-box",
        boxShadow: "0 40px 120px rgba(0,0,0,0.7), 0 0 0 2px #2b2b2e inset",
        transform: `translateY(${y + float}px)`,
      }}
    >
      <div style={{ position: "relative", width: W, height: H, borderRadius: 62, overflow: "hidden", background: BG }}>
        {SHOTS.map((s) => {
          const a = interpolate(frame, [s.from, s.from + FADE, s.to - FADE, s.to], [0, 1, 1, 0], clamp);
          if (a <= 0) return null;
          const t = interpolate(frame, [s.from, s.to], [0, 1], clamp);
          const first = s.from === SHOTS[0].from;
          const o = first ? interpolate(frame, [s.from, s.from + FADE], [0, 1], clamp) * (frame > s.to - FADE ? a : 1) : a;
          return (
            <Img
              key={s.file}
              src={staticFile(`screens/${s.file}.png`)}
              style={{
                position: "absolute",
                inset: 0,
                width: W,
                height: H,
                opacity: o,
                transform: `scale(${1 + t * 0.03})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const Title = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 16 } });
  const outP = interpolate(frame, [PHONE_IN, PHONE_IN + 18], [1, 0], clamp);
  const backIn = interpolate(frame, [PHONE_OUT + 10, PHONE_OUT + 40], [0, 1], clamp);
  const o = frame < 450 ? Math.min(inP, outP) : backIn;
  const scale = frame < 450 ? 0.9 + 0.1 * inP : 0.94 + 0.06 * backIn;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o, fontFamily }}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <Img src={staticFile("wordmark.png")} style={{ width: 360 }} />
        <div style={{ color: "#fff", fontSize: 52, fontWeight: 800, letterSpacing: -1, marginTop: 34 }}>
          Run your shop&apos;s day
        </div>
        <div style={{ color: "#8d8d8d", fontSize: 34, fontWeight: 500, marginTop: 10 }}>from your pocket</div>
      </div>
    </AbsoluteFill>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at ${620 + drift}px 1150px, rgba(194,69,30,0.35), rgba(194,69,30,0) 70%)`,
        }}
      />
      <Title />
      {BEATS.map((b) => (
        <Caption key={b.caption} beat={b} />
      ))}
      <Phone />
    </AbsoluteFill>
  );
};
