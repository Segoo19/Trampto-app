# TRAMPTO · Spot de 15 s — «De la duda a la prueba»

> **Máster:** vertical 9:16 · 1080 × 1920 · 30 fps · 15,0 s (450 fotogramas)
> **Objetivo:** que en 15 segundos se entienda qué hace TRAMPTO y por qué importa, con un antes/después inequívoco.
> **Público:** autónomos y pymes que envían presupuestos, contratos y facturas en PDF.
> **En esta carpeta:** este guion · [`animatic.html`](animatic.html) (animática fiel a tiempos y transiciones) · [`render.mjs`](render.mjs) (la exporta a MP4) · [`assets/sello.png`](assets/sello.png) (el sello del logo recortado con transparencia).

---

## 1. La idea

**Insight.** Un PDF se edita en segundos y una copia retocada parece tan legítima como el original. El problema no es solo que te cambien un dato: es que **no puedes demostrar cuál es el bueno**.

**Idea.** *Sin TRAMPTO, tu PDF es una duda. Con TRAMPTO, es una prueba.*

El spot convierte esa frase en imagen con una **rima visual**: enseñamos dos veces la misma composición —dos copias de un presupuesto, una junto a otra—. La primera vez solo hay preguntas. La segunda, respuestas.

| | Antes · sin TRAMPTO | Después · con TRAMPTO |
|---|---|---|
| Encuadre | Dos copias con «¿ORIGINAL?» encima | Las mismas dos copias, en la misma posición |
| Respuesta | Ninguna: «¿Cuál es el original?» | Inmediata: **✓ Documento auténtico** / **✕ Sello no válido** |
| Mundo | Navy apagado y frío, grano, glitch | Navy de marca con oro, burdeos y el azul de las ondas |
| Chip superior | ● SIN TRAMPTO (logo en gris) | ✓ CON TRAMPTO (logo a color) |

**El giro es el propio logo.** El sello 3D cae, golpea, y sus ondas azules —las del logotipo— barren la pantalla y devuelven el color al mundo. La transición firma del spot sale de la marca, no de una librería de efectos.

**Por qué funciona en 15 s:** un documento, un dato (4.800 € → 1.800 €), una pregunta y su respuesta. Se entiende el producto sin conocer la palabra «hash».

---

## 2. Estructura

| Acto | Tiempo | Fotogramas | Función | Mensaje |
|---|---|---|---|---|
| 1 · Gancho | 0,0 – 2,0 s | 0 – 59 | Problema | Un PDF se edita en segundos |
| 2 · Antes | 2,0 – 4,0 s | 60 – 119 | Problema | ¿Cuál es el original? |
| 3 · El giro | 4,0 – 5,0 s | 120 – 149 | Solución · marca | Con TRAMPTO |
| 4 · Cómo funciona | 5,0 – 9,0 s | 150 – 269 | Solución · producto | Sube · Sella · Comparte |
| 5 · Después | 9,0 – 12,0 s | 270 – 359 | Prueba | Si cambia un solo dato, el sello lo delata |
| 6 · Cierre | 12,0 – 15,0 s | 360 – 449 | CTA | Sella y verifica tus documentos · 3 gratis |

Reparto: problema 27 % · solución 33 % · prueba 20 % · llamada a la acción 20 %. Todos los eventos clave caen en la rejilla de la música (120 BPM, un compás cada 2 s).

---

## 3. Guion plano a plano

### Escena 1 · Gancho — 0,0 → 2,0 s

**Imagen**
- Fondo navy frío y apagado (`#0B1020 → #141B2E`), viñeta marcada y grano de película.
- Un presupuesto en PDF —«PRESUPUESTO Nº 2026-014 · Estudio Norte S.L. · TOTAL 4.800,00 €»— entra con *focus pull*: desenfoque 24 px → nítido, escala 1,06 → 1.
- Arriba, el chip **● SIN TRAMPTO**: logo en gris, punto rojo.
- 0,7 s — empuje de cámara hacia el total (×1,18). Aparece un cursor de texto y una selección azul sobre el «4».
- 1,1 s — **glitch** de 5 fotogramas (separación RGB y franjas desplazadas): el «4» se convierte en «1». El total pasa a **1.800,00 €**.
- 1,4 s — la cámara se retira.

**Texto en pantalla:** «Un PDF se edita / en *segundos*.» — Playfair Display 700, blanco, *segundos* en cursiva. Entra línea a línea con máscara (de abajo arriba, 0,12 s de desfase).
**Locución:** «Un PDF se edita en segundos.»
**Sonido:** pulso filtrado y tic-tac · clic de teclado (1,0 s) · glitch digital (1,1 s).

### Escena 2 · Antes, sin TRAMPTO — 2,0 → 4,0 s

**Imagen**
- 2,0 s — **transición de clonado**: el documento se duplica y las dos copias se separan a izquierda y derecha (escala 0,6; giro −4° / +4°) con estela de movimiento.
- La izquierda dice 4.800 €; la derecha, 1.800 €. Sobre las dos, la misma etiqueta en mono: **«¿ORIGINAL?»**. Un «?» rojo parpadea con glitch sobre cada copia.
- 3,4 s — **anticipación**: la escena se oscurece, una sombra elíptica crece en el centro y el sello 3D entra desde arriba acelerando (rampa de velocidad, estiramiento vertical por velocidad).

**Texto en pantalla:** «¿Cuál es / el *original*?» + subtítulo en DM Sans, rojo suave (`#F2A7A1`): «¿Y cómo lo demuestras?»
**Locución:** «¿Cuál es el original?»
**Sonido:** el pulso sigue filtrado · *riser* de 3,0 a 4,0 s con el filtro abriéndose.

### Escena 3 · El giro: el sello — 4,0 → 5,0 s

**Imagen**
- 4,0 s — **IMPACTO** en el centro (*downbeat*, coincide con el *drop*): aplastamiento de 2 fotogramas, sacudida de cámara de 6 fotogramas y destello dorado.
- **Barrido de onda** (*ripple wipe*): tres anillos en el azul del logo (`#076EC1 → #4DA3FF`) se expanden en perspectiva, como las ondas del logotipo. El primero arrastra el color: el mundo gris desaparece y aparece el fondo de marca (navy `#0A1438`, halo `#16266A`, resplandor dorado).
- Las dos copias dudosas salen despedidas por la onda (giro + desenfoque + fundido).
- El chip gira en 3D: **● SIN TRAMPTO → ✓ CON TRAMPTO** (oro).
- 4,4 s — **logo lock**: el sello se eleva y vuela, encogiéndose, hasta el icono del chip. Desde aquí el logo queda fijo arriba como mosca de marca.

**Texto en pantalla:** «Con *TRAMPTO*» — TRAMPTO en DM Sans 800 con degradado dorado (`#F3E3B3 → #C49A22`).
**Locución:** «Con Trampto:»
**Sonido:** **golpe del sello** (logo sonoro: golpe seco de madera + sub-grave + brillo cristalino) y *drop* de la música a pleno espectro.

### Escena 4 · Cómo funciona — 5,0 → 9,0 s

Un panel de **cristal líquido** (translúcido, con canto de luz especular) sube desde abajo y contiene la **interfaz real de la app** sobre su fondo claro. Encima, una barra de progreso de tres segmentos que se rellena en oro, paso a paso.

| Paso | Tiempo | Imagen | Texto en pantalla | Locución |
|---|---|---|---|---|
| **1 · Sube** | 5,0 – 6,0 s | Cabecera de la app, selector «Sellar \| Verificar» y la zona «Arrastra tu documento aquí». El presupuesto entra volando y cae dentro: el borde dorado se ilumina y rebota. | «*1* Sube.» / «PDF, Word, PowerPoint o imagen» | «súbelo,» |
| **2 · Sella** | 6,0 – 7,5 s | El panel cambia a la vista de sellado: una línea de escaneo dorada recorre la página y se marcan los pasos reales de la app (*Calculando la huella SHA-256* ✓ · *Sellando página a página* ✓ · *Registrando el sello público* ✓). La huella se descifra carácter a carácter: `79f29d93…51b51d6a`. A los 7,0 s, el sello burdeos y oro aparece con un rebote elástico y se encoge hasta la esquina inferior derecha de la página: es el **microsello** real, discreto, que no toca el diseño del documento. | «*2* Sella.» / «Huella SHA-256 única + Seal ID» | «séllalo» |
| **3 · Comparte** | 7,5 – 9,0 s | Resultado «Documento sellado» con el ID de sello `TRP-da0d949d-…` y el enlace público `trampto-app.vercel.app/v/79f29d93…`. A los 8,0 s (*downbeat*) se pulsa «Compartir»: la píldora del enlace sale del panel con un brillo y aparece «Enlace copiado ✓». | «*3* Comparte.» / «Cualquiera lo verifica con el enlace» | «y compártelo.» |

**Transiciones:** el panel sube con el *easing* de la app; entre pasos, su contenido cambia con un *morph* (lo saliente sube y se desenfoca, lo entrante aparece desde abajo). Los números de los pasos van en Playfair cursiva con degradado dorado.
**Sonido:** golpe suave de «soltar archivo» (5,6 s) · barrido de escaneo con tecleo digital (6,0–7,0 s) · *pop* cristalino del sello (7,0 s) · *tap* + *swoosh* del enlace (8,0 s).

### Escena 5 · Después, con TRAMPTO — 9,0 → 12,0 s

**Imagen**
- 9,0 s — **blur-zoom**: el panel se aleja desenfocándose y vuelven las dos copias **en la misma posición que en la escena 2**, ahora con el microsello en la esquina.
- 9,3 s — el mismo cursor intenta el mismo cambio en la copia de la derecha: «4» → «1», con el mismo glitch.
- 9,8 s — **detección instantánea**: la copia derecha se tiñe de rojo (`#B3261E`) y vibra; su etiqueta pasa de «¿ORIGINAL?» a **«RETOCADO»** (efecto *scramble*) y aparece el badge **✕ Sello no válido**.
- 10,0 s (*downbeat*) — la copia izquierda se ilumina en verde (`#1A7F4B`): etiqueta **«ORIGINAL»** y badge **✓ Documento auténtico**.
- Bajo cada copia, su huella: izquierda `79f29d93…51b51d6a · coincide ✓` · derecha `ee02568a…b64bfd19 · no coincide ✕`.
- 11,6 s — **iris de onda**: un anillo azul se expande desde el centro y abre el cierre.

**Texto en pantalla:** «¿Alguien lo retoca?» (9,0–9,8 s) → «Si cambia un solo dato, / el sello *lo delata*.» (*lo delata* en cursiva dorada).
**Locución:** «Si alguien cambia un solo dato, el sello lo delata.»
**Sonido:** glitch (9,5 s) · zumbido grave de error (9,8 s) · campanilla positiva de dos notas (10,0 s) · *whoosh* del iris (11,6 s).

### Escena 6 · Cierre y llamada a la acción — 12,0 → 15,0 s

**Imagen**
- Fondo idéntico a la banda *hero* de la web y la app (navy `#0A1438`, halo `#16266A` arriba, resplandor dorado abajo) con ondas concéntricas tenues que laten desde el logo.
- 12,0 s — el icono de la app (el sello sobre baldosa blanca redondeada) aparece con rebote elástico; las ondas azules laten a los 12,0 y 14,0 s.
- 12,3 s — **TRAMPTO** en DM Sans 700; el espaciado se cierra de 0,7 em a 0,32 em, como en la pantalla de carga de la app.
- 12,5 s — «Sella y verifica / *tus documentos*.» en Playfair Display; *tus documentos* en cursiva con degradado dorado, igual que el titular de la app.
- 13,1 s — filete dorado + píldora burdeos **«Gratis tus 3 primeros documentos»**; destello que la recorre a los 13,8 s.
- 13,4 s — dominio `trampto-app.vercel.app` en oro claro (`#EAD7A1`).
- 14,0 – 15,0 s — último latido y plano fijo: se lee con calma, funciona como miniatura y el bucle de la plataforma no corta nada.

**Locución:** «Trampto. Sella y verifica tus documentos.»
**Sonido:** la música resuelve · repetición suave del golpe del sello a los 14,0 s · cola limpia hasta 15,0 s.

---

## 4. Locución

Castellano de España. Voz cálida y segura, ritmo ágil pero sin prisa; tensión contenida en el problema, sonrisa a partir de «Con Trampto». 32 palabras, unas 2,1 por segundo, con aire para la música.

| Entrada | Salida | Texto |
|---|---|---|
| 0,2 s | 1,8 s | Un PDF se edita en segundos. |
| 2,1 s | 3,5 s | ¿Cuál es el original? |
| 4,1 s | 4,8 s | Con Trampto: |
| 5,05 s | 5,6 s | súbelo, |
| 6,05 s | 6,6 s | séllalo |
| 7,55 s | 8,4 s | y compártelo. |
| 9,1 s | 11,7 s | Si alguien cambia un solo dato, el sello lo delata. |
| 12,2 s | 14,4 s | Trampto. Sella y verifica tus documentos. |

El spot **funciona sin sonido**: todo lo que dice la voz está también en pantalla, porque la mayoría del vídeo en redes se ve en silencio.

---

## 5. Música y diseño sonoro

**Música:** electrónica minimalista a **120 BPM** (un compás = 2 s). De 0 a 4 s, filtrada y tensa (paso bajo, tic-tac, texturas de glitch); a los 4,0 s, *drop* luminoso en tonalidad mayor con pulso limpio y *plucks*; resolución a los 12,0 s y final seco a los 15,0 s. Busca en librerías con licencia comercial términos como *minimal tech*, *modern corporate*, *uplifting electronic*.

**Logo sonoro — «el golpe del sello»:** golpe seco de madera + sub-grave corto + brillo cristalino de dos notas en quinta. Suena dos veces: en el impacto (4,0 s) y, más suave, en el cierre (14,0 s). Repetido en todas las piezas, se convierte en el sonido de la marca.

| Tiempo | Música | Efecto |
|---|---|---|
| 0,0 s | Entra el pulso filtrado | Tic-tac |
| 1,0 – 1,1 s | — | Clic de teclado + glitch |
| 2,0 s | Compás 2 | *Swoosh* del clonado |
| 3,0 – 4,0 s | *Riser*, se abre el filtro | Silbido de caída del sello |
| **4,0 s** | **Drop** | **Golpe del sello** + onda |
| 5,6 s | — | Archivo que cae |
| 6,0 – 7,0 s | Compás 4 | Escaneo + tecleo digital |
| 7,0 s | — | *Pop* del sello |
| 8,0 s | Compás 5 | *Tap* + *swoosh* del enlace |
| 9,5 – 9,8 s | Filtro momentáneo | Glitch + zumbido de error |
| 10,0 s | Compás 6 | Campanilla positiva |
| 11,6 s | — | *Whoosh* del iris |
| 12,0 s | Resolución | Brillo del logo |
| 14,0 s | Última nota | Golpe del sello suave |

Mezcla para redes: −14 LUFS integrados, *true peak* −1 dBTP. La voz siempre por encima de la música.

---

## 6. Sistema visual «2026»

Moderno sin depender de modas pasajeras: cristal líquido, objeto 3D con peso, tipografía editorial cinética, datos convertidos en textura y transiciones que nacen de la forma del logo.

### Paleta (extraída del código y del logo)

| Color | Hex | Papel en el spot |
|---|---|---|
| Navy noche | `#0A1438` | Fondo base de marca (banda *hero*) |
| Navy | `#0D1B4B` | Texto de la interfaz, botones primarios |
| Halo navy | `#16266A` | Luz superior del fondo |
| Oro | `#C49A22` | Acentos, progreso, escaneo, filetes |
| Oro claro | `#EAD7A1` / `#F3E3B3` | Degradado de las palabras clave, dominio |
| Burdeos | `#7A1F1F` | El sello, el microsello, la píldora del CTA |
| Azul onda | `#076EC1` (luz `#4DA3FF`) | Ondas: impacto, iris y latido del logo |
| Verde verificación | `#1A7F4B` | «Documento auténtico» |
| Rojo error | `#B3261E` | «Sello no válido», glitch |
| Navy apagado | `#0B1020 → #141B2E` | Solo en el «antes» |

Antes del impacto el mundo está deliberadamente apagado, pero la marca nunca desaparece: el navy, el chip con el nombre y el logo siguen en pantalla. El color pleno llega con el sello: ese contraste es el antes/después.

### Tipografía (la de la app)
- **Playfair Display** 700/800 para los titulares; cursiva con degradado dorado para la palabra clave de cada frase.
- **DM Sans** 600–800 para etiquetas, interfaz y el nombre TRAMPTO con espaciado amplio.
- **JetBrains Mono** para huellas, Seal ID y etiquetas técnicas («¿ORIGINAL?»).

### Movimiento
- **Las mismas curvas que la app:** `cubic-bezier(.22, 1, .36, 1)` para entradas y salidas, y `cubic-bezier(.34, 1.56, .64, 1)` para los rebotes del sello (el `seal-pop` de la interfaz). El vídeo se mueve como se mueve el producto.
- Ningún plano está quieto más de medio segundo hasta el cierre; la cámara siempre deriva un poco (parallax 2,5D).
- Cada evento importante cae en el *beat*.
- Grano sutil durante todo el spot; aberración cromática solo en los glitches.

### Catálogo de transiciones

| # | Tiempo | Transición | Descripción |
|---|---|---|---|
| 1 | 0,0 s | *Focus pull* | El documento pasa de desenfocado a nítido |
| 2 | 1,1 s | Glitch | Separación RGB + franjas desplazadas, 5 fotogramas |
| 3 | 2,0 s | Clonado | Un documento se divide en dos con estela |
| 4 | 3,4 – 4,0 s | Rampa de velocidad | Caída acelerada del sello con estiramiento por velocidad |
| 5 | **4,0 s** | **Barrido de onda** | Las ondas del logo revelan el mundo de marca (transición firma) |
| 6 | 4,4 s | *Logo lock* | El sello vuela y se convierte en el icono del chip |
| 7 | 4,6 / 6,0 / 7,5 s | Cristal líquido + *morph* | El panel sube y su contenido se transforma paso a paso |
| 8 | 9,0 s | *Blur-zoom* | El panel se aleja desenfocándose y vuelve la composición dividida |
| 9 | 9,0 s | Rima compositiva | Mismo encuadre que el «antes», ahora con respuesta |
| 10 | 11,6 s | Iris de onda | Un anillo azul abre el cierre desde el centro |
| 11 | 12,3 / 13,8 s | *Tracking-in* + destello | El nombre se cierra como en la pantalla de carga; brillo en el CTA |

---

## 7. Presencia de marca, segundo a segundo

| Tramo | Logo | Nombre TRAMPTO | Colores de marca |
|---|---|---|---|
| 0 – 4 s | Icono gris en el chip; el sello 3D entra a los 3,4 s | Chip «SIN TRAMPTO» | Navy (apagado) |
| 4 – 5 s | **Sello 3D a pantalla completa** + ondas | «Con TRAMPTO» + chip | Burdeos, oro, azul onda, navy |
| 5 – 9 s | Chip + cabecera de la app + microsello | Chip + cabecera de la app | Navy, oro, burdeos |
| 9 – 12 s | Chip + microsello en ambas copias | Chip | Navy, oro, verde/rojo funcionales |
| 12 – 15 s | **Icono de la app protagonista** + ondas | **TRAMPTO** grande | Navy, oro, burdeos (CTA), azul onda |

El logo y el nombre están en pantalla el 100 % del tiempo.

---

## 8. Formatos y entrega

| Formato | Uso | Adaptación |
|---|---|---|
| **9:16 · 1080 × 1920** (máster) | Reels, TikTok, Shorts, Stories | Tal cual |
| 1:1 · 1080 × 1080 | Feed de Instagram, LinkedIn | Titulares encima a 0,8×; las copias se reducen a 0,75× |
| 16:9 · 1920 × 1080 | YouTube, web, presentaciones | Las copias del antes/después ganan aire en horizontal; titulares en el tercio izquierdo |

- **Zonas seguras (9:16):** deja libres unos 250 px arriba, 420 px abajo y 140 px a la derecha (interfaz de TikTok y Reels). La animática respeta estos márgenes; actívalos con la tecla `S`.
- **Exportación:** H.264 High, 1080 × 1920, 30 fps, 12–16 Mbps, `yuv420p`; audio AAC 48 kHz 320 kbps.
- **Miniatura:** el último fotograma (cierre completo).

### Versiones derivadas
- **Bumper de 6 s** (YouTube): las dos copias con «¿Cuál es el original?» (0–1,5 s) → golpe del sello (1,5 s) → veredictos ✓/✕ (1,5–4 s) → cierre (4–6 s).
- **Sin locución:** música, efectos y textos en pantalla (formato nativo de TikTok).
- **Inglés** (la app ya está en 9 idiomas; se usa su copy oficial):

| ES | EN |
|---|---|
| Un PDF se edita en segundos. | A PDF can be edited in seconds. |
| ¿Cuál es el original? | Which one is the original? |
| ¿Y cómo lo demuestras? | And how do you prove it? |
| Con TRAMPTO | With TRAMPTO |
| Sube. · Sella. · Comparte. | Upload. · Seal. · Share. |
| Si cambia un solo dato, el sello lo delata. | Change a single digit and the seal gives it away. |
| Documento auténtico / Sello no válido | Authentic document / Invalid seal |
| Sella y verifica tus documentos. | Seal and verify your documents. |
| Gratis tus 3 primeros documentos | Your first 3 documents free |

### Variantes de gancho para un test A/B
1. «¿Te han cambiado un presupuesto?» (pregunta directa al dolor).
2. «4.800 €… o 1.800 €» (el dato en grande desde el fotograma 1).
3. La versión del guion: «Un PDF se edita en segundos.»

---

## 9. Producción

**La animática** (`animatic.html`) reproduce el spot completo en el navegador con el logo, los colores, las tipografías y los tiempos de este guion. Sirve de referencia exacta para edición o *motion* (After Effects, Cavalry, Premiere, CapCut) y como versión 0 publicable una vez se le añadan música y voz.

- Ábrela en Chrome desde el repositorio (usa `../../public/icon-512.png` y `assets/sello.png`).
- Controles: `Espacio` reproduce o pausa · `←` / `→` avanzan un fotograma · `S` muestra las zonas seguras · la barra inferior permite ir a cualquier punto.
- **Exportar a MP4** (requiere ffmpeg en el `PATH`):

  ```bash
  npm i --no-save playwright && npx playwright install chromium
  node marketing/video-15s/render.mjs          # → marketing/video-15s/trampto-spot-15s-9x16.mp4
  ```

- El dominio del cierre es una constante (`DOMAIN`) al principio del script de la animática. Si `trampto.com` apunta a la app, úsalo: es más corto y se recuerda mejor.
- Los datos que se ven (huellas, Seal ID, presupuesto) son de demostración, pero tienen el formato real: SHA-256 de 64 caracteres y `TRP-` + UUID.

**Para pasar a producción final:** grabar la locución, licenciar la música, sustituir el render de la animática por la versión de *motion* si se quiere más acabado 3D (por ejemplo, un render del sello con iluminación real en el impacto) y exportar los tres formatos.

---

## 10. Rigor: qué afirma el spot y dónde está respaldado

| Afirmación del spot | Respaldo en el producto |
|---|---|
| Sube PDF, Word, PowerPoint o imagen | `seal.dropSubtitle` y conversión en `src/lib/convert.ts` |
| Huella SHA-256 + Seal ID | `sealPdf()` y `TRP-${sealId}` en `src/lib/seal.ts` y `Home.tsx` |
| Los tres pasos de sellado que se ven | `seal.stepHashing`, `seal.stepSealing`, `seal.stepRegistering` |
| El microsello en la esquina no altera el diseño | `drawDiscreetMark()` (≈6 mm, 15 % de opacidad) |
| Se comparte un enlace y cualquiera lo verifica | `verificationUrl()` → `/v/{hash}`, vista pública sin cuenta |
| Si cambia un solo dato, el sello lo delata | Cualquier cambio altera la huella del PDF → «Sello no válido» |
| Gratis tus 3 primeros documentos | `FREE_LIMIT = 3` en `src/lib/usage.ts` |

**Qué no decir:**
- Que el documento «nunca sale de tu dispositivo»: el sellado se calcula en local, pero el PDF sellado se guarda para que el enlace público permita verlo y descargarlo.
- Que tiene «validez legal» por sí solo: TRAMPTO acredita integridad, autoría y fecha y complementa a la firma electrónica, pero no la sustituye.
- Que el sello visible es grande: el golpe del sello es la metáfora de marca; en el documento real queda el microsello discreto, y eso es lo que muestra el plano final.
