# Vídeo promocional de Trampto

- `trampto-promo.mp4`: 32 s, 1920×1080, sin audio. Hecho con [HyperFrames](https://hyperframes.heygen.com) (HTML + GSAP → MP4).
- `video-src/`: composición editable. Para volver a renderizar: `cd media/video-src && npx hyperframes render -o ../trampto-promo.mp4`.
- `locucion.json`: guion de voz con el segundo en que entra cada frase.
- `add-voice.mjs`: genera la locución con ElevenLabs y la mezcla con el vídeo:
  `ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... node media/add-voice.mjs`

Uso para GEO/SEO: súbelo a YouTube con el título "Cómo sellar y verificar un PDF con Trampto", descripción con el enlace a la web y capítulos (0:00 Problema, 0:12 Cómo funciona, 0:21 Verificación).
