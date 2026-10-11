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
npm run render:apertura   # exporta out/vector-15s.mp4 (H.264 + AAC)
```

El render usa el `headless_shell` de Chromium preinstalado en el entorno
(la ruta está en `package.json`). En otra máquina basta con borrar el flag
`--browser-executable` y Remotion descarga su propio navegador.

## Estructura

- `src/Apertura.tsx` — pieza de 15 s: cámara 3D por el caos → corte → partículas que se ordenan → el pez de Vector
- `src/logo.tsx` — logo de Vector recreado en SVG (pez animable + palabra VECTOR con reflejo)
- `src/interfaces.tsx` — interfaces e ilustraciones (planilla con cursor, chat, tareas, papeles, notas, reloj, tablero)
- `src/fx.tsx` — titulares cinéticos, etiquetas mono, vidrio, polvo, piso 3D, grano y viñeta
- `src/theme.ts` — colores, tipografías y curvas de animación
- `scripts/generate_sfx.py` — música y efectos sintetizados desde cero (sin samples de terceros)
- `docs/guion.md` — concepto, guion completo y lista de grabaciones

## Versión liviana para WhatsApp

```bash
ffmpeg -i out/vector-15s.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart out/vector-15s-liviano.mp4
```
