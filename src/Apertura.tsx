import { getLength, getPointAtLength } from "@remotion/paths";
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AmbientGlow, Atmosphere, Dust, FloorGrid, Headline, MonoTag } from "./fx";
import { ChatCard, ClockFace, Dashboard, LoopCard, PaperSheet, Spreadsheet, StickyNote, Toast } from "./interfaces";
import { FISH_H, FISH_LOWER, FISH_UPPER, FISH_W, Fish, Wordmark } from "./logo";
import { color, easeIn, easeInOut, easeOut, font, hash, keys, prog } from "./theme";

/**
 * Apertura del video (15 s):
 *   0–3 s    «¿Cansado de cargar todo a mano?» sobre una planilla que no termina
 *   3–8 s    la cámara recorre el caos: errores, chats, tareas en bucle, papeles
 *   8 s      la línea azul (el vector) corta el caos
 *   8–11 s   los pedazos se reacomodan en un sistema ordenado
 *   11–15 s  la luz nada hasta formar el pez de Vector → logo
 */
export const APERTURA_FRAMES = 450;
export const SLICE = 240;
const OUTRO = 310; // salida del tablero
const SWIM = 318; // la luz entra nadando
const DRAW = 350; // se dibuja el pez
const FORMED = 376; // pez completo

type Item = { id: string; x: number; y: number; z: number; w: number; h: number; enter: number; sway?: number; node: React.ReactNode };

const ITEMS: Item[] = [
  { id: "sheet", x: 0, y: 0, z: 0, w: 900, h: 560, enter: 0, node: <Spreadsheet fillStart={4} errorStart={104} /> },
  { id: "chat", x: 980, y: -40, z: -380, w: 460, h: 620, enter: 70, node: <ChatCard start={100} /> },
  { id: "loop", x: -940, y: 90, z: -260, w: 580, h: 440, enter: 100, node: <LoopCard start={150} /> },
  { id: "paper1", x: -560, y: -330, z: -620, w: 230, h: 300, enter: 30, sway: 1, node: <PaperSheet seed={1} /> },
  { id: "paper2", x: 560, y: 360, z: -200, w: 230, h: 300, enter: 60, sway: -1, node: <PaperSheet seed={2} stamp="REVISAR" /> },
  { id: "note1", x: 480, y: -400, z: 60, w: 190, h: 180, enter: 40, sway: 1.4, node: <StickyNote text="¡¡URGENTE!! llamar al proveedor" /> },
  { id: "note2", x: -1300, y: -260, z: -420, w: 190, h: 180, enter: 120, sway: -1.2, node: <StickyNote text="no olvidar cargar las facturas" tone="#7cc4ff" /> },
  { id: "clock", x: -420, y: 400, z: 120, w: 210, h: 210, enter: 150, sway: 0.6, node: <ClockFace /> },
  { id: "paper3", x: 1500, y: 300, z: -700, w: 230, h: 300, enter: 110, sway: 0.8, node: <PaperSheet seed={3} stamp="FALTA" /> },
];

const TOASTS = [
  { text: "3 pedidos sin responder", tone: "red" as const, at: 206, x: 330, y: -360, z: 160 },
  { text: "Planilla_final_v8.xlsx", tone: "amber" as const, at: 211, x: -560, y: -330, z: 120 },
  { text: "Recordatorio: cargar facturas", tone: "blue" as const, at: 216, x: -260, y: 380, z: 240 },
  { text: "¿Quién cambió esto?", tone: "amber" as const, at: 220, x: 620, y: 330, z: 200 },
  { text: "Error al guardar", tone: "red" as const, at: 224, x: -980, y: -120, z: 300 },
  { text: "Falta el stock de ayer", tone: "red" as const, at: 228, x: 1020, y: 120, z: 260 },
];

/** Cámara: hacia dónde mira (tx, ty, tz), qué tan cerca (zoom) y su giro. Siempre en movimiento. */
const useCamera = (f: number) => {
  const drift = Math.sin(f / 37);
  return {
    tx: keys(f, [[0, -40], [96, 30], [118, -330], [146, -290], [168, 650], [194, 690], [214, -1270], [228, -1230], [240, 0]]) + drift * 18,
    ty: keys(f, [[0, 10], [96, -10], [194, -40], [214, 90], [240, 0]]) + Math.cos(f / 29) * 10,
    tz: keys(f, [[0, 0], [146, 0], [168, -380], [194, -380], [214, -260], [240, -150]]),
    zoom: keys(f, [[0, -140], [96, 170], [118, 40], [146, 70], [168, 30], [194, 70], [214, 30], [228, -200], [240, -820]]),
    ry: keys(f, [[0, 12], [96, -3], [146, 4], [168, -10], [194, -8], [214, 9], [240, 0]]) + drift * 1.5,
    rx: keys(f, [[0, 8], [96, 3], [240, 6]]),
  };
};

const World: React.FC = () => {
  const f = useCurrentFrame();
  if (f > SLICE + 50) return null;
  const cam = useCamera(f);
  const tension = prog(f, 200, 40, easeIn);
  const shakeX = (hash(f) - 0.5) * 14 * tension;
  const shakeY = (hash(f + 50) - 0.5) * 10 * tension;
  const focusX = cam.tx + 330;
  const gone = prog(f, SLICE, 4); // al cortar, todo se convierte en partículas
  return (
    <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: "50% 45%", opacity: 1 - gone }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformStyle: "preserve-3d",
          transform: `translate3d(${960 + shakeX}px, ${540 + shakeY}px, ${cam.zoom}px) rotateX(${-cam.rx}deg) rotateY(${cam.ry}deg) translate3d(${-cam.tx}px, ${-cam.ty}px, ${-cam.tz}px)`,
        }}
      >
        <FloorGrid y={560} />
        <Dust />
        {ITEMS.map((it, i) => {
          const dist = Math.hypot(it.x - focusX, (it.z - cam.tz) * 1.4);
          const pullBack = prog(f, 214, 26);
          const hookBlur = i === 0 ? 2.5 * (1 - prog(f, 92, 14)) : 0;
          const blur = hookBlur + Math.min(9, Math.max(0, (dist - 260) / 110)) * (1 - pullBack * 0.7);
          const enter = prog(f, it.enter, 30);
          const sway = it.sway ?? 0;
          const floatY = sway ? Math.sin(f / 24 + i) * 14 : 0;
          const rot = sway ? Math.sin(f / 31 + i * 2) * 6 * sway + sway * 8 : 0;
          return (
            <div
              key={it.id}
              style={{
                position: "absolute",
                width: it.w,
                height: it.h,
                opacity: enter,
                filter: `blur(${blur}px)`,
                transform: `translate3d(${it.x - it.w / 2 + (hash(f + i * 9) - 0.5) * 10 * tension}px, ${
                  it.y - it.h / 2 + floatY + (1 - enter) * 120
                }px, ${it.z}px) rotateZ(${rot + (1 - enter) * 20 * (sway || 0.3)}deg)`,
              }}
            >
              {it.node}
            </div>
          );
        })}
        {TOASTS.map((t, i) => (
          <div
            key={t.text}
            style={{
              position: "absolute",
              transform: `translate3d(${t.x + (hash(f + i) - 0.5) * 8 * tension}px, ${t.y}px, ${t.z}px)`,
            }}
          >
            <Toast text={t.text} tone={t.tone} at={t.at} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Velo oscuro detrás de los titulares para que siempre se lean. */
const Scrim: React.FC<{ side: "center" | "left"; opacity: number }> = ({ side, opacity }) => (
  <AbsoluteFill
    style={{
      opacity,
      background:
        side === "center"
          ? "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.82), rgba(0,0,0,0.2) 85%)"
          : "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 32%, rgba(0,0,0,0) 55%)",
    }}
  />
);

const PAINS = [
  { from: 112, to: 160, idx: "01", parts: [{ text: "Planillas que" }, { text: "nadie entiende.", accent: true }] },
  { from: 160, to: 208, idx: "02", parts: [{ text: "Pedidos perdidos" }, { text: "en el chat.", accent: true }] },
  { from: 208, to: 238, idx: "03", parts: [{ text: "La misma tarea," }, { text: "todos los días.", accent: true }] },
];

const Texts: React.FC = () => {
  const f = useCurrentFrame();
  if (f > SLICE + 10) return null;
  return (
    <>
      <Scrim side="center" opacity={keys(f, [[0, 0], [8, 1], [92, 1], [104, 0]])} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <MonoTag text="¿Te suena?" start={2} exit={88} style={{ marginBottom: 30 }} />
        <Headline
          parts={[{ text: "¿Cansado de cargar" }, { text: "todo a mano?", accent: true }]}
          start={8}
          exit={90}
          size={136}
          stagger={4}
          align="center"
          width={1500}
        />
      </AbsoluteFill>
      <Scrim side="left" opacity={keys(f, [[100, 0], [114, 1], [232, 1], [242, 0]])} />
      {PAINS.map((p) =>
        f >= p.from - 2 && f < p.to + 16 ? (
          <AbsoluteFill key={p.idx} style={{ justifyContent: "center", paddingLeft: 140 }}>
            <MonoTag text={`${p.idx} / 03`} start={p.from} exit={p.to - 4} style={{ marginBottom: 26 }} />
            <Headline parts={p.parts} start={p.from + 2} exit={p.to - 4} size={96} stagger={3} width={840} />
          </AbsoluteFill>
        ) : null,
      )}
    </>
  );
};

/** El vector: una línea de luz que cruza la pantalla en diagonal y corta el caos. */
const Slice: React.FC = () => {
  const f = useCurrentFrame();
  const p = prog(f, SLICE - 4, 12, easeInOut);
  const fade = 1 - prog(f, SLICE + 8, 16);
  const flash = keys(f, [[SLICE - 1, 0], [SLICE + 1, 0.22], [SLICE + 8, 0]]);
  if (f < SLICE - 6 || f > SLICE + 40) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "#9fbaff", opacity: flash, mixBlendMode: "screen" }} />
      <div
        style={{
          position: "absolute",
          left: -200,
          top: 540,
          width: 2400 * p,
          height: 4,
          opacity: fade,
          transformOrigin: "0 50%",
          transform: "rotate(-12deg)",
          background: `linear-gradient(90deg, rgba(108,155,255,0) 0%, ${color.blueLight} 60%, #ffffff 100%)`,
          boxShadow: `0 0 30px 6px ${color.blue}, 0 0 90px 20px rgba(37,99,235,0.6)`,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * El caos se rompe en pedazos que vuelan, primero empujados por el corte y
 * después atraídos hacia el tablero, donde se acomodan.
 */
const SHARDS = Array.from({ length: 170 }).map((_, i) => {
  const a = hash(i) * Math.PI * 2;
  const r = Math.sqrt(hash(i + 1));
  const x0 = 960 + Math.cos(a) * r * 820;
  const y0 = 520 + Math.sin(a) * r * 400;
  const side = y0 < 540 - (x0 - 960) * Math.tan((12 * Math.PI) / 180) ? -1 : 1; // de qué lado del corte quedó
  const tone = hash(i + 2);
  return {
    x0,
    y0,
    bx: x0 + (hash(i + 3) - 0.5) * 260,
    by: y0 + side * (90 + hash(i + 4) * 200),
    x2: 960 + hash(i + 5) * 860,
    y2: 270 + hash(i + 6) * 520,
    size: 5 + hash(i + 7) * 20,
    delay: hash(i + 8) * 14,
    rot: (hash(i + 9) - 0.5) * 720,
    tint: tone < 0.12 ? color.red : tone < 0.2 ? color.amber : tone < 0.3 ? color.blueLight : "#dfe3ea",
  };
});

const Shards: React.FC = () => {
  const f = useCurrentFrame();
  if (f < SLICE || f > SLICE + 70) return null;
  return (
    <AbsoluteFill>
      {SHARDS.map((s, i) => {
        const t = prog(f, SLICE + s.delay, 50, easeInOut);
        const u = 1 - t;
        const x = u * u * s.x0 + 2 * u * t * s.bx + t * t * s.x2;
        const y = u * u * s.y0 + 2 * u * t * s.by + t * t * s.y2;
        const size = s.size * (1 - t * 0.75);
        const opacity = (t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2) * prog(f, SLICE, 3);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size * 0.62,
              borderRadius: 2,
              background: t > 0.55 ? color.blueLight : s.tint,
              boxShadow: t > 0.55 ? `0 0 10px ${color.blue}` : "none",
              opacity: opacity * 0.9,
              transform: `rotate(${s.rot * u}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Resolution: React.FC = () => {
  const f = useCurrentFrame();
  const s = SLICE + 16;
  if (f < s || f > SWIM + 20) return null;
  const enter = prog(f, s, 36, easeOut);
  const out = prog(f, OUTRO, 18, easeInOut);
  return (
    <AbsoluteFill>
      <AmbientGlow intensity={enter * 1.6 * (1 - out)} x={68} y={55} />
      <AbsoluteFill style={{ perspective: 2000 }}>
        <div
          style={{
            position: "absolute",
            left: 900,
            top: 250,
            opacity: Math.min(enter, 1 - out),
            filter: `blur(${out * 16}px)`,
            transformOrigin: "0% 50%",
            transform: `scale(${0.9 + out * 0.5}) translate3d(${(1 - enter) * 120}px, ${(1 - enter) * 40}px, ${(1 - enter) * -400 + out * 500}px) rotateY(${-22 + 8 * enter + Math.sin(f / 40) * 1.5}deg) rotateX(${4 * (1 - enter)}deg)`,
          }}
        >
          <Dashboard start={s} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          paddingLeft: 140,
          opacity: 1 - out,
          filter: `blur(${out * 12}px)`,
          transform: `translateX(${-out * 80}px)`,
        }}
      >
        <MonoTag text="Hay otra forma" start={s + 2} style={{ marginBottom: 26 }} />
        <Headline
          parts={[{ text: "Tu negocio puede" }, { text: "funcionar mejor.", accent: true }]}
          start={s + 4}
          size={92}
          stagger={4}
          width={820}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ Final: el pez
const K = 2.6; // escala del pez (unidades → px)
const WORD = 96;
const FISH_PX = FISH_W * K;
const WORD_W = WORD * 1.5 * 5 + WORD * 1.6;
const GAP = 58;
const LEFT = (1920 - (FISH_PX + GAP + WORD_W)) / 2;
const CY = 500;
const FX = LEFT; // origen del pez en pantalla
const FY = CY - (FISH_H * K) / 2;
const toScreen = (p: { x: number; y: number }) => ({ x: FX + p.x * K, y: FY + p.y * K });
const NOSE = toScreen({ x: 2, y: 17 });
const SWIM_PATH = `M -200 940 C 20 700, 140 1010, 240 780 S ${NOSE.x - 150} ${NOSE.y + 60}, ${NOSE.x} ${NOSE.y}`;
const SWIM_LEN = getLength(SWIM_PATH);
const ARC_LEN = getLength(FISH_UPPER);

/** Cabeza de luz con estela. */
const Comet: React.FC<{ x: number; y: number; size?: number; opacity?: number }> = ({ x, y, size = 1, opacity = 1 }) => (
  <>
    <circle cx={x} cy={y} r={44 * size} fill="url(#comet-halo)" opacity={opacity} />
    <circle cx={x} cy={y} r={8 * size} fill="white" opacity={opacity} />
  </>
);

const Finale: React.FC = () => {
  const f = useCurrentFrame();
  if (f < SWIM) return null;
  const swim = prog(f, SWIM, DRAW - SWIM, easeInOut);
  const draw = prog(f, DRAW, FORMED - DRAW, easeInOut);
  const metal = prog(f, FORMED, 16);
  const bloom = keys(f, [[FORMED - 2, 0], [FORMED + 2, 1], [FORMED + 30, 0]], easeOut);
  const ring = prog(f, FORMED, 40, easeOut);
  const word = prog(f, FORMED + 6, 30, easeOut);
  const shine = interpolate(f, [FORMED + 34, FORMED + 62], [-0.2, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag = prog(f, FORMED + 40, 22);
  const push = interpolate(f, [FORMED, 450], [1, 1.045]);
  // el pez "nada en el lugar": flota y se inclina apenas
  const idle = prog(f, FORMED + 10, 20);
  const bob = Math.sin((f - FORMED) / 13) * 5 * idle;
  const tilt = Math.sin((f - FORMED) / 17) * 1.6 * idle;

  const head = getPointAtLength(SWIM_PATH, SWIM_LEN * swim) ?? NOSE;
  const trail = 320;
  const upHead = toScreen(getPointAtLength(FISH_UPPER, ARC_LEN * draw) ?? { x: 2, y: 17 });
  const loHead = toScreen(getPointAtLength(FISH_LOWER, ARC_LEN * draw) ?? { x: 2, y: 17 });
  const cross = toScreen({ x: 94, y: 17 });

  return (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      {/* rayos de luz detrás del logo */}
      <AbsoluteFill
        style={{
          opacity: 0.5 * metal,
          background: `conic-gradient(from ${f * 0.4}deg at ${NOSE.x + FISH_PX * 0.4}px ${CY}px, rgba(37,99,235,0) 0deg, rgba(37,99,235,0.18) 20deg, rgba(37,99,235,0) 40deg, rgba(37,99,235,0) 90deg, rgba(108,155,255,0.14) 115deg, rgba(37,99,235,0) 140deg, rgba(37,99,235,0) 200deg, rgba(37,99,235,0.16) 230deg, rgba(37,99,235,0) 260deg, rgba(37,99,235,0) 360deg)`,
          maskImage: `radial-gradient(circle at ${NOSE.x + FISH_PX * 0.4}px ${CY}px, black 0%, transparent 55%)`,
        }}
      />
      <AmbientGlow intensity={1.3 * metal} x={((NOSE.x + FISH_PX * 0.5) / 1920) * 100} y={(CY / 1080) * 100} />

      <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
        <defs>
          <radialGradient id="comet-halo">
            <stop offset="0" stopColor="#cfe0ff" stopOpacity="0.9" />
            <stop offset="0.35" stopColor={color.blueLight} stopOpacity="0.45" />
            <stop offset="1" stopColor={color.blue} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* la luz que nada */}
        {f < DRAW + 6 && (
          <g opacity={1 - prog(f, DRAW, 6)}>
            <path
              d={SWIM_PATH}
              fill="none"
              stroke={color.blue}
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray={`${Math.min(trail, SWIM_LEN * swim)} ${SWIM_LEN * 2}`}
              strokeDashoffset={-Math.max(0, SWIM_LEN * swim - trail)}
              style={{ filter: "blur(8px)" }}
              opacity={0.8}
            />
            <path
              d={SWIM_PATH}
              fill="none"
              stroke="#dbe6ff"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${Math.min(trail, SWIM_LEN * swim)} ${SWIM_LEN * 2}`}
              strokeDashoffset={-Math.max(0, SWIM_LEN * swim - trail)}
            />
            <Comet x={head.x} y={head.y} />
          </g>
        )}
        {/* se divide en dos y dibuja los arcos */}
        {f >= DRAW && f < FORMED + 8 && (
          <g opacity={1 - prog(f, FORMED, 8)}>
            <Comet x={upHead.x} y={upHead.y} size={0.9} />
            <Comet x={loHead.x} y={loHead.y} size={0.9} />
          </g>
        )}
        {/* onda expansiva al completarse */}
        {f >= FORMED && ring < 1 && (
          <circle cx={cross.x - 40} cy={cross.y} r={40 + ring * 700} fill="none" stroke={color.blueLight} strokeWidth={3 * (1 - ring)} opacity={0.7 * (1 - ring)} />
        )}
        {/* burbujas: el pececito respira */}
        {f > FORMED + 20 &&
          Array.from({ length: 7 }).map((_, i) => {
            const born = FORMED + 20 + i * 8;
            const life = (f - born) / 46;
            if (life < 0 || life > 1) return null;
            const bx = NOSE.x - 6 - life * 26 + Math.sin(life * 9 + i) * 6;
            const by = NOSE.y + bob - 8 - life * 150;
            return (
              <circle
                key={i}
                cx={bx}
                cy={by}
                r={3 + (i % 3) * 2 + life * 3}
                fill="none"
                stroke="rgba(200,215,255,0.7)"
                strokeWidth={1.5}
                opacity={Math.sin(life * Math.PI)}
              />
            );
          })}
      </svg>

      {/* bloom al cerrarse el pez */}
      <AbsoluteFill
        style={{
          opacity: bloom,
          background: `radial-gradient(circle at ${cross.x}px ${cross.y}px, rgba(220,232,255,0.85) 0%, rgba(108,155,255,0.35) 8%, rgba(37,99,235,0) 30%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: FX - 4 * K,
          top: FY - 4 * K + bob,
          transform: `rotate(${tilt}deg)`,
          transformOrigin: "60% 50%",
        }}
      >
        <Fish width={(FISH_W + 8) * K} draw={draw} metal={metal} glow={0.5 + bloom * 1.5} shine={shine} id="final-fish" />
      </div>

      <div style={{ position: "absolute", left: LEFT + FISH_PX + GAP, top: CY - WORD * 0.6 }}>
        <Wordmark size={WORD} reveal={word} shine={shine} id="final-word" />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CY + 110,
          textAlign: "center",
          opacity: tag,
          transform: `translateY(${(1 - tag) * 16}px)`,
          filter: `blur(${(1 - tag) * 6}px)`,
        }}
      >
        <div style={{ fontFamily: font.sans, fontSize: 34, fontWeight: 400, letterSpacing: "0.01em", color: color.text }}>
          Soluciones digitales <span style={{ fontFamily: font.serif, fontStyle: "italic", fontSize: 40, color: color.blueLight }}>a la medida</span> de tu negocio
        </div>
        <div style={{ marginTop: 18, fontFamily: font.mono, fontSize: 20, letterSpacing: "0.14em", color: color.muted, opacity: prog(f, FORMED + 50, 18) }}>
          ALAN APPEL · ALAN-APPEL.GITHUB.IO
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Apertura: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: color.bg }}>
      <AmbientGlow intensity={1 - prog(f, SLICE, 10)} />
      <World />
      <Texts />
      <Shards />
      <Slice />
      <Resolution />
      <Finale />
      <Atmosphere />
      <Audio src={staticFile("audio/apertura-sonido.wav")} />
    </AbsoluteFill>
  );
};
