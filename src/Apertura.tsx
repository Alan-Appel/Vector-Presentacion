import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { AmbientGlow, Atmosphere, Dust, FloorGrid, Headline, MonoTag } from "./fx";
import { ChatCard, Dashboard, LoopCard, Spreadsheet, Toast } from "./interfaces";
import { color, easeIn, easeInOut, easeOut, hash, keys, prog } from "./theme";

/**
 * Apertura del video (10 s). Muestra de estilo:
 *   0–3 s   «¿Cansado de cargar todo a mano?» sobre una planilla que no termina
 *   3–8 s   la cámara recorre el caos: planillas con errores, chats, tareas en bucle
 *   8–10 s  la línea azul (el vector) corta el caos → todo queda en orden
 */
export const APERTURA_FRAMES = 300;
export const SLICE = 240;

type Item = { id: string; x: number; y: number; z: number; w: number; h: number; node: React.ReactNode };

const ITEMS: Item[] = [
  { id: "sheet", x: 0, y: 0, z: 0, w: 900, h: 560, node: <Spreadsheet fillStart={4} errorStart={104} /> },
  { id: "chat", x: 980, y: -40, z: -380, w: 460, h: 620, node: <ChatCard start={100} /> },
  { id: "loop", x: -940, y: 90, z: -260, w: 580, h: 440, node: <LoopCard start={150} /> },
];

const TOASTS = [
  { text: "3 pedidos sin responder", tone: "red" as const, at: 206, x: 330, y: -360, z: 160 },
  { text: "Planilla_final_v8.xlsx", tone: "amber" as const, at: 211, x: -560, y: -330, z: 120 },
  { text: "Recordatorio: cargar facturas", tone: "blue" as const, at: 216, x: -260, y: 380, z: 240 },
  { text: "¿Quién cambió esto?", tone: "amber" as const, at: 220, x: 620, y: 330, z: 200 },
  { text: "Error al guardar", tone: "red" as const, at: 224, x: -980, y: -120, z: 300 },
  { text: "Falta el stock de ayer", tone: "red" as const, at: 228, x: 1020, y: 120, z: 260 },
];

/** Cámara: hacia dónde mira (tx, ty, tz), qué tan cerca (zoom) y su giro. */
const useCamera = (f: number) => ({
  tx: keys(f, [[0, 0], [96, 0], [116, -330], [146, -330], [168, 980 - 330], [194, 980 - 330], [214, -940 - 330], [226, -940 - 330], [240, 0]]),
  ty: keys(f, [[0, 0], [194, -40], [214, 90], [240, 0]]),
  tz: keys(f, [[0, 0], [146, 0], [168, -380], [194, -380], [214, -260], [240, -150]]),
  zoom: keys(f, [[0, -120], [96, 170], [116, 40], [214, 40], [240, -820]]),
  ry: keys(f, [[0, 12], [96, -3], [146, 4], [168, -10], [194, -8], [214, 9], [240, 0]]),
  rx: keys(f, [[0, 8], [96, 3], [240, 6]]),
});

const World: React.FC = () => {
  const f = useCurrentFrame();
  const cam = useCamera(f);
  // Temblor de cámara creciente justo antes del corte.
  const tension = prog(f, 200, 40, easeIn);
  const shakeX = (hash(f) - 0.5) * 14 * tension;
  const shakeY = (hash(f + 50) - 0.5) * 10 * tension;
  const focusX = cam.tx + 330;
  return (
    <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: "50% 45%" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transformStyle: "preserve-3d",
          transform: `translate3d(${960 + shakeX}px, ${540 + shakeY}px, ${cam.zoom}px) rotateX(${-cam.rx}deg) rotateY(${cam.ry}deg) translate3d(${-cam.tx}px, ${-cam.ty}px, ${-cam.tz}px)`,
        }}
      >
        <FloorGrid y={560} opacity={1 - prog(f, SLICE, 30)} />
        <Dust />
        {ITEMS.map((it, i) => {
          // Profundidad de campo: lo que no está en foco se desenfoca.
          const dist = Math.hypot(it.x - focusX, (it.z - cam.tz) * 1.4);
          const pullBack = prog(f, 214, 26);
          const hookBlur = i === 0 ? 2.5 * (1 - prog(f, 92, 14)) : 0;
          const blur = hookBlur + Math.min(9, Math.max(0, (dist - 260) / 110)) * (1 - pullBack * 0.7);
          // Caída al ser cortado por el vector.
          const fall = prog(f, SLICE + 2 + i * 3, 34, easeIn);
          const jitter = tension * (1 - fall);
          const enter = prog(f, i === 0 ? 0 : 60 + i * 20, 30);
          return (
            <div
              key={it.id}
              style={{
                position: "absolute",
                width: it.w,
                height: it.h,
                opacity: enter * (1 - fall),
                filter: `blur(${blur + fall * 18}px)`,
                transform: `translate3d(${it.x - it.w / 2 + (hash(f + i * 9) - 0.5) * 10 * jitter}px, ${
                  it.y - it.h / 2 + fall * 900 + (1 - enter) * 80
                }px, ${it.z}px) rotateZ(${fall * (i % 2 ? 22 : -18)}deg) rotateX(${fall * 40}deg)`,
              }}
            >
              {it.node}
            </div>
          );
        })}
        {TOASTS.map((t, i) => {
          const fall = prog(f, SLICE + 1 + i * 2, 28, easeIn);
          return (
            <div
              key={t.text}
              style={{
                position: "absolute",
                opacity: 1 - fall,
                filter: `blur(${fall * 14}px)`,
                transform: `translate3d(${t.x + (hash(f + i) - 0.5) * 8 * tension}px, ${t.y + fall * 700}px, ${t.z}px) rotateZ(${fall * (i % 2 ? 30 : -30)}deg)`,
              }}
            >
              <Toast text={t.text} tone={t.tone} at={t.at} />
            </div>
          );
        })}
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

const Resolution: React.FC = () => {
  const f = useCurrentFrame();
  const s = SLICE + 8;
  const enter = prog(f, s, 40, easeOut);
  if (f < s) return null;
  return (
    <AbsoluteFill>
      <AmbientGlow intensity={enter * 1.6} x={68} y={55} />
      <AbsoluteFill style={{ perspective: 2000 }}>
        <div
          style={{
            position: "absolute",
            left: 900,
            top: 250,
            opacity: enter,
            transformOrigin: "0% 50%",
            transform: `scale(0.9) translate3d(${(1 - enter) * 200}px, ${(1 - enter) * 60}px, ${(1 - enter) * -600}px) rotateY(${-22 + 8 * enter}deg) rotateX(${4 * (1 - enter)}deg)`,
          }}
        >
          <Dashboard start={s} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 140 }}>
        <MonoTag text="Hay otra forma" start={s + 6} style={{ marginBottom: 26 }} />
        <Headline
          parts={[{ text: "Tu negocio puede" }, { text: "funcionar mejor.", accent: true }]}
          start={s + 8}
          size={92}
          stagger={4}
          width={820}
        />
        <Img
          src={staticFile("marca/vector-logo-white.png")}
          style={{ width: 300, marginTop: 52, mixBlendMode: "screen", opacity: prog(f, s + 30, 18) }}
        />
      </AbsoluteFill>
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
      <Slice />
      <Resolution />
      <Atmosphere />
      <Audio src={staticFile("audio/apertura-sonido.wav")} />
    </AbsoluteFill>
  );
};
