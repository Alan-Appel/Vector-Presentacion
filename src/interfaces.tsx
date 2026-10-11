import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Glass } from "./fx";
import { color, easeOut, font, hash, prog } from "./theme";

/**
 * Interfaces ilustrativas (no son productos ni datos reales): representan
 * situaciones cotidianas de cualquier negocio.
 */

// ------------------------------------------------------------ Planilla
const COLS = [
  { label: "", w: 46 },
  { label: "Cliente", w: 190 },
  { label: "Detalle", w: 200 },
  { label: "Cant.", w: 80 },
  { label: "Monto", w: 150 },
  { label: "Estado", w: 150 },
];
const ROWS = Array.from({ length: 14 }).map((_, r) => [
  String(r + 2),
  `Cliente ${String(1000 + Math.floor(hash(r) * 8999))}`,
  ["Pedido mayorista", "Reposición", "Envío interior", "Cambio", "Pedido web"][r % 5],
  String(1 + Math.floor(hash(r + 40) * 24)),
  `Gs. ${(Math.floor(hash(r + 9) * 90) * 10 + 50).toLocaleString("es-PY")}.000`,
  ["Pendiente", "¿Pagado?", "Revisar", "Pendiente", "Sin datos"][r % 5],
]);
const ERRORS: Record<string, string> = { "2-4": "#¡REF!", "5-3": "#N/A", "7-4": "#¡VALOR!", "9-1": "Duplicado", "11-5": "???" };

export const Spreadsheet: React.FC<{ fillStart: number; errorStart: number }> = ({ fillStart, errorStart }) => {
  const frame = useCurrentFrame();
  const cells = ROWS.length * (COLS.length - 1);
  // La carga se acelera: cada vez más rápido, cada vez más tedioso.
  const typed = interpolate(frame, [fillStart, fillStart + 110], [0, cells * 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t * 0.4 + t * 0.6,
  });
  const done = Math.floor(typed);
  const partial = typed - done;
  const rowCounter = Math.floor(1180 + Math.max(0, frame - fillStart) * 1.7);
  return (
    <Glass
      width={900}
      height={560}
      title="ventas_FINAL_v7 (copia).xlsx"
      badge={<span style={{ fontFamily: font.mono, fontSize: 14, color: color.muted }}>Fila {rowCounter.toLocaleString("es-PY")}</span>}
    >
      <div style={{ display: "flex", fontSize: 15, fontWeight: 500, color: color.muted, borderBottom: `1px solid ${color.line}` }}>
        {COLS.map((c, i) => (
          <div key={i} style={{ width: c.w, padding: "10px 12px", borderRight: `1px solid ${color.line}` }}>
            {c.label || " "}
          </div>
        ))}
      </div>
      {ROWS.map((row, r) => (
        <div key={r} style={{ display: "flex", fontSize: 16, borderBottom: `1px solid ${color.line}` }}>
          {row.map((value, c) => {
            const idx = r * (COLS.length - 1) + (c - 1);
            const isIndex = c === 0;
            const filled = isIndex || idx < done;
            const active = !isIndex && idx === done && frame >= fillStart;
            const err = ERRORS[`${r}-${c}`];
            const errOn = err && frame >= errorStart + (r % 4) * 5;
            const flicker = errOn && Math.floor(frame / 3) % 5 !== 0;
            let text = filled ? value : active ? value.slice(0, Math.ceil(value.length * partial)) : "";
            if (errOn) text = err;
            return (
              <div
                key={c}
                style={{
                  width: COLS[c].w,
                  height: 31,
                  padding: "6px 12px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  borderRight: `1px solid ${color.line}`,
                  color: isIndex ? color.muted : errOn ? color.red : color.text,
                  fontFamily: isIndex ? font.mono : font.sans,
                  fontSize: isIndex ? 13 : 16,
                  background: errOn
                    ? `rgba(255,90,95,${flicker ? 0.16 : 0.06})`
                    : active
                      ? "rgba(37,99,235,0.18)"
                      : "transparent",
                  outline: active ? `2px solid ${color.blue}` : "none",
                  outlineOffset: -2,
                }}
              >
                {text}
                {active && Math.floor(frame / 4) % 2 === 0 ? "|" : ""}
              </div>
            );
          })}
        </div>
      ))}
      {frame >= fillStart && frame < fillStart + 150 && (() => {
        // El puntero salta de celda en celda: la carga manual, literal.
        const pos = (k: number) => {
          const r = Math.floor(k / (COLS.length - 1));
          const c = (k % (COLS.length - 1)) + 1;
          const x = COLS.slice(0, c).reduce((a, col) => a + col.w, 0) + COLS[c].w * 0.55;
          return { x, y: 38 + r * 32 + 20 };
        };
        const a = pos(Math.max(0, done - 1));
        const b = pos(done);
        const m = Math.min(1, partial / 0.35);
        const e = 1 - Math.pow(1 - m, 3);
        return (
          <div style={{ position: "absolute", left: a.x + (b.x - a.x) * e, top: a.y + (b.y - a.y) * e }}>
            <Cursor press={partial > 0.35 && partial < 0.55 ? 1 : 0} />
          </div>
        );
      })()}
    </Glass>
  );
};

// ------------------------------------------------------------ Chat
const MESSAGES = [
  "Hola, ¿tienen stock?",
  "Quiero 3 unidades",
  "¿Me pasás el precio?",
  "¿Hacen envíos?",
  "¿Llegó mi pedido?",
  "Te escribí ayer 🙏",
  "Hola??",
  "¿Siguen abiertos?",
  "Necesito factura",
  "¿Me confirmás?",
  "Hola",
  "¿Alguien?",
];

export const ChatCard: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  // Mensajes cada vez más seguidos.
  const at = (i: number) => start + Math.round(18 * i - 0.6 * i * i);
  const count = MESSAGES.filter((_, i) => frame >= at(i)).length;
  const badge = Math.min(99, 4 + count * 9 + Math.max(0, frame - start) / 3);
  return (
    <Glass
      width={460}
      height={620}
      title="Pedidos"
      badge={
        <div
          style={{
            minWidth: 34,
            height: 26,
            padding: "0 8px",
            borderRadius: 13,
            background: color.red,
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 + 0.25 * Math.max(0, 1 - ((frame - start) % 9) / 5)})`,
          }}
        >
          {badge >= 99 ? "99+" : Math.floor(badge)}
        </div>
      }
    >
      <div style={{ position: "absolute", inset: 0, padding: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 0 }}>
        {MESSAGES.map((m, i) => {
          const p = prog(frame, at(i), 10, easeOut);
          if (p <= 0) return null;
          return (
            <div key={i} style={{ maxHeight: 74 * p, overflow: "visible" }}>
              <div
                style={{
                  marginTop: 12,
                  width: "fit-content",
                  maxWidth: 320,
                  padding: "13px 18px",
                  borderRadius: "18px 18px 18px 6px",
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${color.line}`,
                  fontSize: 19,
                  color: color.text,
                  opacity: p,
                  transform: `scale(${0.85 + 0.15 * p})`,
                  transformOrigin: "0% 100%",
                }}
              >
                {m}
                <span style={{ marginLeft: 10, fontSize: 12, color: color.muted, fontFamily: font.mono }}>
                  {`${21 + Math.floor(i / 5)}:${String(10 + ((i * 7) % 49)).padStart(2, "0")}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Glass>
  );
};

// ------------------------------------------------------------ Tarea repetida
const TASKS = ["Copiar datos del correo", "Pegar en la planilla", "Armar el reporte", "Enviar por WhatsApp"];
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Lunes", "Martes", "Miércoles"];

export const LoopCard: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - start);
  const period = 22;
  const cycle = Math.floor(local / period);
  const t = local % period;
  return (
    <Glass width={580} height={440} title="Tareas de hoy">
      <div style={{ padding: "26px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="54" height="54" viewBox="0 0 24 24" style={{ transform: `rotate(${local * 9}deg)` }}>
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
              fill="none"
              stroke={color.blueLight}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", color: color.white }}>
              {DAYS[cycle % DAYS.length]}
            </div>
            <div style={{ fontFamily: font.mono, fontSize: 14, color: color.muted }}>
              otra vez lo mismo · semana {12 + Math.floor(cycle / 5)}
            </div>
          </div>
        </div>
        {TASKS.map((task, i) => {
          const checked = t >= 3 + i * 4 && t < period - 2;
          return (
            <div
              key={task}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "13px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${color.line}`,
                fontSize: 20,
                color: checked ? color.muted : color.text,
                textDecoration: checked ? "line-through" : "none",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: `2px solid ${checked ? color.blue : color.lineStrong}`,
                  background: checked ? color.blue : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 14,
                }}
              >
                {checked ? "✓" : ""}
              </div>
              {task}
            </div>
          );
        })}
      </div>
    </Glass>
  );
};

// ------------------------------------------------------------ Notificaciones sueltas
export const Toast: React.FC<{ text: string; tone?: "red" | "amber" | "blue"; at: number }> = ({ text, tone = "red", at }) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, 12, easeOut);
  const dot = tone === "red" ? color.red : tone === "amber" ? color.amber : color.blueLight;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 20px",
        borderRadius: 14,
        background: "rgba(24,27,35,0.95)",
        border: `1px solid ${color.lineStrong}`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        fontFamily: font.sans,
        fontSize: 20,
        fontWeight: 500,
        color: color.text,
        whiteSpace: "nowrap",
        opacity: p,
        transform: `scale(${0.6 + 0.4 * p + Math.sin(p * Math.PI) * 0.08})`,
      }}
    >
      <div style={{ width: 10, height: 10, borderRadius: 5, background: dot, boxShadow: `0 0 12px ${dot}` }} />
      {text}
    </div>
  );
};

// ------------------------------------------------------------ Todo en orden
const STATUS = [
  { label: "Pedidos", value: "Al día" },
  { label: "Stock", value: "Sincronizado" },
  { label: "Reportes", value: "Automáticos" },
];
const FLOW = ["Pedido", "Stock", "Factura", "Cliente"];

export const Dashboard: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const chart = prog(frame, start + 14, 40, easeOut);
  const points = Array.from({ length: 12 }).map((_, i) => {
    const x = (i / 11) * 560;
    const y = 150 - (i * 9 + Math.sin(i * 1.3) * 18 + 20);
    return `${x},${y}`;
  });
  return (
    <Glass width={1040} height={600} title="Tu negocio · todo en un solo lugar" accent="rgba(37,99,235,0.18)">
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ width: 200, borderRight: `1px solid ${color.line}`, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {["Inicio", "Pedidos", "Clientes", "Stock", "Reportes"].map((n, i) => (
            <div
              key={n}
              style={{
                padding: "11px 14px",
                borderRadius: 10,
                fontSize: 17,
                fontWeight: 500,
                color: i === 0 ? color.white : color.muted,
                background: i === 0 ? "rgba(37,99,235,0.22)" : "transparent",
                opacity: prog(frame, start + 4 + i * 2, 12),
              }}
            >
              {n}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", gap: 16 }}>
            {STATUS.map((s, i) => {
              const p = prog(frame, start + 8 + i * 4, 18);
              return (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${color.line}`,
                    opacity: p,
                    transform: `translateY(${(1 - p) * 24}px)`,
                  }}
                >
                  <div style={{ fontSize: 15, color: color.muted }}>{s.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: 24, fontWeight: 600, color: color.white }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: color.green,
                        color: "#062",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: `scale(${prog(frame, start + 18 + i * 4, 10)})`,
                      }}
                    >
                      ✓
                    </span>
                    {s.value}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ flex: 1, borderRadius: 14, border: `1px solid ${color.line}`, background: "rgba(255,255,255,0.02)", padding: "18px 22px", position: "relative" }}>
            <div style={{ fontSize: 15, color: color.muted, marginBottom: 8 }}>Actividad</div>
            <svg width="560" height="160" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={color.blue} stopOpacity="0.35" />
                  <stop offset="1" stopColor={color.blue} stopOpacity="0" />
                </linearGradient>
                <clipPath id="reveal">
                  <rect x="0" y="-20" width={560 * chart} height="200" />
                </clipPath>
              </defs>
              <g clipPath="url(#reveal)">
                <polygon points={`0,160 ${points.join(" ")} 560,160`} fill="url(#area)" />
                <polyline points={points.join(" ")} fill="none" stroke={color.blueLight} strokeWidth="3" strokeLinejoin="round" />
              </g>
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {FLOW.map((step, i) => {
              const p = prog(frame, start + 20 + i * 5, 14);
              const pulse = ((frame - start) % 30) / 30;
              return (
                <React.Fragment key={step}>
                  <div
                    style={{
                      padding: "10px 18px",
                      borderRadius: 999,
                      border: `1px solid ${color.lineStrong}`,
                      fontSize: 16,
                      fontWeight: 500,
                      color: color.text,
                      opacity: p,
                    }}
                  >
                    {step}
                  </div>
                  {i < FLOW.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: color.line, position: "relative", opacity: p }}>
                      <div
                        style={{
                          position: "absolute",
                          top: -3,
                          left: `${pulse * 100}%`,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          background: color.blueLight,
                          boxShadow: `0 0 12px ${color.blueLight}`,
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </Glass>
  );
};

// ------------------------------------------------------------ Ilustraciones sueltas del caos
/** Hoja de papel con renglones y un sello. */
export const PaperSheet: React.FC<{ stamp?: string; seed?: number }> = ({ stamp = "PENDIENTE", seed = 1 }) => (
  <div
    style={{
      width: 230,
      height: 300,
      borderRadius: 6,
      background: "linear-gradient(170deg, #f1f2f5, #d9dce3)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
      padding: "26px 22px",
      position: "relative",
      fontFamily: font.sans,
    }}
  >
    <div style={{ height: 12, width: "55%", background: "#9aa1ad", borderRadius: 3, marginBottom: 18 }} />
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        style={{ height: 6, width: `${60 + hash(i + seed * 13) * 38}%`, background: "#bfc4cd", borderRadius: 3, marginBottom: 13 }}
      />
    ))}
    <div
      style={{
        position: "absolute",
        right: 16,
        bottom: 34,
        transform: "rotate(-14deg)",
        border: `3px solid ${color.red}`,
        color: color.red,
        fontWeight: 800,
        fontSize: 20,
        letterSpacing: "0.08em",
        padding: "4px 10px",
        borderRadius: 6,
        opacity: 0.85,
      }}
    >
      {stamp}
    </div>
  </div>
);

/** Nota adhesiva. */
export const StickyNote: React.FC<{ text: string; tone?: string }> = ({ text, tone = "#f5c451" }) => (
  <div
    style={{
      width: 190,
      height: 180,
      background: `linear-gradient(160deg, ${tone}, #e0a92f)`,
      boxShadow: "0 24px 50px rgba(0,0,0,0.5)",
      padding: 22,
      fontFamily: font.serif,
      fontStyle: "italic",
      fontSize: 34,
      lineHeight: 1.05,
      color: "#3a2a05",
      clipPath: "polygon(0 0, 100% 0, 100% 86%, 88% 100%, 0 100%)",
    }}
  >
    {text}
  </div>
);

/** Reloj con las agujas girando rápido: el tiempo que se va. */
export const ClockFace: React.FC<{ speed?: number }> = ({ speed = 1 }) => {
  const frame = useCurrentFrame();
  const min = frame * 24 * speed;
  return (
    <svg width="210" height="210" viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}>
      <circle cx="50" cy="50" r="46" fill="#14171e" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="9"
          x2="50"
          y2={i % 3 === 0 ? 17 : 13}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={i % 3 === 0 ? 2.4 : 1.4}
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <line x1="50" y1="50" x2="50" y2="27" stroke="white" strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${min / 12} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="15" stroke={color.blueLight} strokeWidth="2.2" strokeLinecap="round" transform={`rotate(${min} 50 50)`} />
      <circle cx="50" cy="50" r="3.5" fill="white" />
    </svg>
  );
};

/** Puntero del mouse. */
export const Cursor: React.FC<{ press?: number }> = ({ press = 0 }) => (
  <svg width="34" height="40" viewBox="0 0 17 20" style={{ transform: `scale(${1 - press * 0.15})`, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }}>
    <path d="M1 1 L1 16 L5 12 L8 19 L11 18 L8 11 L14 11 Z" fill="white" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);
