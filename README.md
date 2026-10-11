# Vector — video de presentación

Video de ~45 s de Alan Appel / Vector para LinkedIn y para compartir por WhatsApp.
Hecho con [Remotion](https://www.remotion.dev/). La identidad (colores, tipografías,
logo, foto y servicios) sale del portafolio
([alan-appel.github.io](https://alan-appel.github.io/)).

## Uso

```bash
npm install
npm run sfx               # regenera el diseño sonoro (public/audio/apertura-sonido.wav)
npm run studio            # vista previa interactiva
npm run render:apertura   # exporta out/apertura.mp4 (H.264 + AAC)
```

El render usa el `headless_shell` de Chromium preinstalado en el entorno
(la ruta está en `package.json`). En otra máquina basta con borrar el flag
`--browser-executable` y Remotion descarga su propio navegador.

## Estructura

- `src/Apertura.tsx` — apertura de 10 s: cámara 3D por el caos → corte → orden
- `src/interfaces.tsx` — interfaces ilustrativas (planilla, chat, tareas, notificaciones, tablero)
- `src/fx.tsx` — titulares cinéticos, etiquetas mono, vidrio, polvo, piso 3D, grano y viñeta
- `src/theme.ts` — colores, tipografías y curvas de animación
- `scripts/generate_sfx.py` — música y efectos sintetizados desde cero (sin samples de terceros)
- `docs/guion.md` — concepto, guion completo y lista de grabaciones
