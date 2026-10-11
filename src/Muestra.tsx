import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  Atmosphere,
  BrowserFrame,
  Captions,
  Grid,
  MaskWord,
  MonoLabel,
  progress,
} from "./components";
import { color, easeInOut, font } from "./theme";

/**
 * Muestra de estilo (10 s): gancho → presentación → primer proyecto.
 * Los tiempos están pensados para la voz del guion; cuando llegue la
 * grabación real se ajustan a sus pausas.
 */
export const MUESTRA_FRAMES = 300;

const A = { from: 0, dur: 112 }; // El problema
const B = { from: 112, dur: 112 }; // Quién soy
const C = { from: 220, dur: 80 }; // Primer proyecto

const PROBLEMS = ["Planillas sueltas.", "Mensajes que se pierden.", "Papeles por todos lados."];

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = progress(frame, 90, 14, easeInOut);
  const sweep = progress(frame, 94, 16, easeInOut);
  return (
    <AbsoluteFill>
      <Grid opacity={1 - exit} />
      <MonoLabel start={4} style={{ position: "absolute", top: 90, left: 200 }}>
        01 / ¿Te pasa esto?
      </MonoLabel>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          paddingLeft: 200,
          opacity: 1 - exit,
          transform: `translateX(${-60 * exit}px)`,
          filter: `blur(${8 * exit}px)`,
        }}
      >
        {PROBLEMS.map((text, i) => {
          const strike = progress(frame, 62 + i * 6, 14, easeInOut);
          return (
            <div key={text} style={{ position: "relative", width: "fit-content" }}>
              <div
                style={{
                  fontFamily: font.sans,
                  fontWeight: 600,
                  fontSize: 112,
                  letterSpacing: "-0.035em",
                  lineHeight: 1.12,
                  opacity: interpolate(strike, [0, 1], [1, 0.32]),
                }}
              >
                <MaskWord start={8 + i * 16} duration={18} style={{ color: color.white }}>
                  {text}
                </MaskWord>
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "54%",
                  height: 6,
                  width: `${strike * 100}%`,
                  background: color.blue,
                  boxShadow: `0 0 24px ${color.blue}`,
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* El "vector": una línea que cruza la pantalla y abre la siguiente escena */}
      <div
        style={{
          position: "absolute",
          top: 539,
          left: `${interpolate(sweep, [0, 1], [0, 40])}%`,
          width: `${interpolate(sweep, [0, 0.5, 1], [0, 70, 60])}%`,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${color.blueLight})`,
          opacity: sweep > 0 && sweep < 1 ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const photo = progress(frame, 0, 50);
  const line = progress(frame, 18, 24, easeInOut);
  const exit = progress(frame, 98, 14, easeInOut);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 - 0.03 * exit})` }}>
      <div style={{ position: "absolute", left: 900, top: 0, width: 1020, height: 1080 }}>
        <Img
          src={staticFile("marca/alan-appel.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 30%",
            opacity: photo,
            transform: `scale(${1.08 - 0.08 * photo})`,
            maskImage: "linear-gradient(90deg, transparent 0%, black 30%)",
          }}
        />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 200 }}>
        <MonoLabel start={4} style={{ marginBottom: 28 }}>
          Desarrollador Full Stack · Asunción, Paraguay
        </MonoLabel>
        <div
          style={{
            fontFamily: font.sans,
            fontWeight: 600,
            fontSize: 132,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: color.white,
          }}
        >
          <MaskWord start={6}>Alan</MaskWord> <MaskWord start={12}>Appel</MaskWord>
        </div>
        <div style={{ height: 4, width: 520 * line, background: color.blue, margin: "34px 0 34px" }} />
        <div
          style={{
            fontFamily: font.sans,
            fontWeight: 400,
            fontSize: 44,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            color: color.muted,
            maxWidth: 760,
          }}
        >
          <MaskWord start={40}>Herramientas digitales</MaskWord>{" "}
          <MaskWord start={46}>para que tu negocio</MaskWord>{" "}
          <MaskWord start={52} style={{ color: color.white }}>
            funcione mejor.
          </MaskWord>
        </div>
        <Img
          src={staticFile("marca/vector-logo-white.png")}
          style={{
            width: 340,
            marginTop: 60,
            mixBlendMode: "screen",
            opacity: progress(frame, 54, 20),
            transform: `translateY(${(1 - progress(frame, 54, 20)) * 12}px)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Proyecto: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = progress(frame, 0, 34);
  return (
    <AbsoluteFill>
      <Grid opacity={0.6} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 140 }}>
        <MonoLabel start={6} style={{ marginBottom: 22 }}>
          02 / Software a medida
        </MonoLabel>
        <div
          style={{
            fontFamily: font.sans,
            fontWeight: 600,
            fontSize: 64,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            color: color.white,
            width: 560,
          }}
        >
          <MaskWord start={10}>Sistema de gestión</MaskWord> <MaskWord start={16}>inmobiliaria</MaskWord>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: font.mono,
            fontSize: 17,
            color: color.muted,
            border: `1px solid ${color.line}`,
            borderRadius: 999,
            padding: "8px 16px",
            width: "fit-content",
            opacity: progress(frame, 30, 16),
          }}
        >
          Proyecto propio · datos de prueba
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 170,
          perspective: 2200,
        }}
      >
        <div
          style={{
            opacity: enter,
            transform: `translateY(${(1 - enter) * 120}px) rotateY(${-14 + 6 * enter}deg) rotateX(${8 * (1 - enter)}deg)`,
            transformOrigin: "left center",
          }}
        >
          <BrowserFrame
            src="proyectos/inmobiliaria.jpg"
            url="localhost / gestion-inmobiliaria"
            width={1100}
            zoom={interpolate(frame, [0, 80], [1, 1.07])}
            focus="20% 30%"
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Muestra: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: color.bg }}>
    <Sequence from={A.from} durationInFrames={A.dur}>
      <Hook />
    </Sequence>
    <Sequence from={B.from} durationInFrames={B.dur}>
      <Intro />
    </Sequence>
    <Sequence from={C.from} durationInFrames={C.dur}>
      <Proyecto />
      <Captions
        cues={[{ from: 14, to: 80, text: "Un sistema para administrar propiedades desde un solo lugar." }]}
      />
    </Sequence>
    <Atmosphere />
    <Audio src={staticFile("audio/muestra-sonido.wav")} />
  </AbsoluteFill>
);
