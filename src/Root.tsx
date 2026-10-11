import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import React from "react";
import { Composition, continueRender, delayRender } from "remotion";
import { Muestra, MUESTRA_FRAMES } from "./Muestra";
import { FPS, HEIGHT, WIDTH } from "./theme";

// Esperar a que las fuentes estén listas antes de capturar cualquier frame.
const fontsHandle = delayRender("Cargando tipografías");
Promise.all([
  document.fonts.load('600 100px "Inter"'),
  document.fonts.load('400 100px "Inter"'),
  document.fonts.load('500 100px "Inter"'),
  document.fonts.load('400 20px "JetBrains Mono"'),
]).then(() => continueRender(fontsHandle));

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Muestra"
    component={Muestra}
    durationInFrames={MUESTRA_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
