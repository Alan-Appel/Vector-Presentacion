# Vector — video de presentación

Video de ~45 s de Alan Appel / Vector para LinkedIn y para compartir por WhatsApp.
Hecho con [Remotion](https://www.remotion.dev/) a partir del contenido real del
portafolio ([alan-appel.github.io](https://alan-appel.github.io/), repo
`Alan-Appel/alan-appel.github.io`): textos, capturas, logos y colores salen de ahí.

## Uso

```bash
npm install
npm run sfx              # regenera el diseño sonoro (public/audio/muestra-sonido.wav)
npm run studio           # vista previa interactiva
npm run render:muestra   # exporta out/muestra.mp4 (H.264 + AAC)
```

El render usa el `headless_shell` de Chromium preinstalado en el entorno
(la ruta está en `package.json`). En otra máquina basta con borrar el flag
`--browser-executable` y Remotion descarga su propio navegador.

## Estructura

- `src/Muestra.tsx` — muestra de estilo de 10 s (gancho → presentación → primer proyecto)
- `src/components.tsx` — piezas reutilizables: reveal tipográfico, etiquetas mono, marco de navegador, subtítulos, grano
- `src/theme.ts` — colores y tipografías de la marca (de `app/globals.css` del portafolio)
- `scripts/generate_sfx.py` — música y efectos sintetizados desde cero (sin samples de terceros)
- `docs/guion.md` — concepto, guion completo y lista de grabaciones
