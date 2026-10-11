import { getLength } from "@remotion/paths";
import React from "react";
import { color, font } from "./theme";

/**
 * Logo de Vector recreado en vectores a partir de public/brand del portafolio:
 * el pez (ichthys) son dos arcos que salen de la nariz y se cruzan en la cola,
 * y la palabra VECTOR en una grotesca extendida. Al ser SVG se ve nítido a
 * cualquier tamaño y cada trazo se puede animar por separado.
 */

// Caja del pez: 120 × 34. Nariz en (2,17), cruce en (94,17), colas en x=118.
export const FISH_UPPER = "M2 17 Q48 -15 94 17 L118 33.5";
export const FISH_LOWER = "M2 17 Q48 49 94 17 L118 0.5";
export const FISH_W = 120;
export const FISH_H = 34;

export const Fish: React.FC<{
  width: number;
  /** 0→1: cuánto de cada arco está dibujado. */
  draw?: number;
  /** 0→1: brillo del metal (gradiente plateado como el logo original). */
  metal?: number;
  glow?: number;
  /** posición del reflejo que barre el pez, 0→1 (fuera de rango = sin reflejo) */
  shine?: number;
  strokeWidth?: number;
  id?: string;
}> = ({ width, draw = 1, metal = 1, glow = 0, shine = -1, strokeWidth = 5, id = "fish" }) => {
  const len = getLength(FISH_UPPER) + 1;
  const dash = { strokeDasharray: len, strokeDashoffset: len * (1 - draw) };
  return (
    <svg
      width={width}
      height={(width * (FISH_H + 8)) / (FISH_W + 8)}
      viewBox={`-4 -4 ${FISH_W + 8} ${FISH_H + 8}`}
      style={{ overflow: "visible", filter: glow > 0 ? `drop-shadow(0 0 ${12 * glow}px rgba(108,155,255,${0.9 * glow}))` : undefined }}
    >
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#7d8594" />
          <stop offset="0.35" stopColor="#f4f6fa" />
          <stop offset="0.6" stopColor="#aab1bf" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" x2="1" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset={Math.max(0, shine - 0.12)} stopColor="white" stopOpacity="0" />
          <stop offset={Math.min(1, Math.max(0, shine))} stopColor="white" stopOpacity="1" />
          <stop offset={Math.min(1, shine + 0.12)} stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[FISH_UPPER, FISH_LOWER].map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke={color.blueLight} strokeWidth={strokeWidth} strokeLinecap="butt" style={dash} />
          <path
            d={d}
            fill="none"
            stroke={`url(#${id}-metal)`}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            opacity={metal}
            style={dash}
          />
          {shine >= -0.2 && shine <= 1.2 && (
            <path
              d={d}
              fill="none"
              stroke={`url(#${id}-shine)`}
              strokeWidth={strokeWidth}
              style={{ ...dash, mixBlendMode: "screen" }}
              transform="translate(0 0)"
            />
          )}
        </g>
      ))}
    </svg>
  );
};

/**
 * Palabra VECTOR, en SVG para poder darle relleno con gradiente y un reflejo
 * que la barre. `reveal` 0→1 la muestra letra por letra.
 */
export const Wordmark: React.FC<{
  size: number;
  reveal?: number;
  /** distancia entre centros de letra, en múltiplos de `size` */
  cell?: number;
  shine?: number;
  id?: string;
}> = ({ size, reveal = 1, cell = 1.5, shine = -1, id = "wm" }) => {
  const letters = "VECTOR".split("");
  const w = size * cell * (letters.length - 1) + size * 1.6;
  const h = size * 1.05;
  const band = shine * (w + 600) - 300;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-fill`} gradientUnits="userSpaceOnUse" x1={band - 220} x2={band + 220} y1="0" y2={h * 0.6}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.42" stopColor="#ffffff" />
          <stop offset="0.5" stopColor={shine >= 0 && shine <= 1 ? "#a9c2ff" : "#ffffff"} />
          <stop offset="0.58" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {letters.map((l, i) => {
        const p = Math.min(1, Math.max(0, reveal * (letters.length + 1.5) - i));
        return (
          <g key={i} transform={`translate(${size * 0.75 + i * size * cell} ${h * 0.86}) scale(1.13 0.9)`}>
            <text
              x={0}
              y={0}
              textAnchor="middle"
              fontFamily={font.brand}
              fontSize={size}
              fill={`url(#${id}-fill)`}
              stroke={`url(#${id}-fill)`}
              strokeWidth={size * 0.115}
              strokeLinejoin="round"
              opacity={p}
              style={{
                filter: `blur(${(1 - p) * 8}px)`,
                transform: `translateX(${(1 - p) * -size * 0.6}px)`,
              }}
            >
              {l}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
