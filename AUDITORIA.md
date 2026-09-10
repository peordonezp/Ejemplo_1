# Auditoría WCAG 2.2 AA, UX y responsive

**Alcance:** `index.html`, `styles.css` y `script.js` de la página estática de Cristiano Ronaldo.

**Método:** revisión estática del HTML, CSS y JavaScript; validación con navegador local mediante Playwright en 320 px, 398 px, 768 px y 1440 px; prueba de teclado, interacción de timeline, menú móvil, carga de imágenes, enlaces internos, overflow y sintaxis JavaScript.

**Limitación:** no se ejecutó una herramienta automática completa como axe o Lighthouse. Los resultados de contraste se calcularon sobre los colores definidos en CSS; los textos sobre fotografías y degradados deben confirmarse también con una herramienta visual cuando las imágenes definitivas estén cerradas.

## 1. Resumen ejecutivo

La base es funcional y está bien encaminada: utiliza `header`, `nav`, `main` y `footer`; tiene un único `h1`, secciones con `h2`, nombres accesibles razonables, textos `alt` descriptivos, controles de timeline implementados como botones y navegación interna funcional. El JavaScript no presenta errores de sintaxis ni errores observados durante las pruebas.

Se encontraron **dos hallazgos altos** que conviene resolver antes de considerar el sitio conforme a WCAG 2.2 AA:

1. Los colores `--gold` y `--lime` sobre fondos claros no alcanzan el contraste mínimo.
2. Los enlaces del menú móvil permanecen en el orden de tabulación aunque el menú está visualmente desplazado fuera de la pantalla.

Además, hay mejoras medias y bajas recomendables para el nombre del control móvil, la semántica de datos, los objetivos táctiles y la estabilidad de imágenes externas.

## 2. Hallazgos críticos, altos, medios y bajos

### Críticos

No se identificaron hallazgos críticos mediante el código y las pruebas realizadas.

### Altos

#### A-01. Contraste insuficiente en la paleta clara

- **Criterio relacionado:** WCAG 2.2, 1.4.3 Contraste mínimo.
- **Evidencia:** `styles.css`, variables `--gold` y `--lime`, selector `.eyebrow` y selector `h1 em, h2 span`.
- `#e6bd62` sobre `#f4f1e9`: ratio aproximado **1.57:1**.
- `#c7e86b` sobre `#f4f1e9`: ratio aproximado **1.23:1**.
- Los encabezados grandes con `h2 span` necesitan al menos 3:1 y el texto pequeño de `.eyebrow` necesita 4.5:1. Ambas combinaciones fallan.
- **Impacto:** los rótulos dorados y las palabras destacadas en lima pueden resultar difíciles de leer para personas con baja visión o deficiencias de percepción del color.
- **Recomendación:** oscurecer los colores usados sobre fondos claros o reservar `--gold` y `--lime` para el fondo oscuro. Volver a medir cada combinación con una herramienta de contraste, incluyendo estados hover y focus.

#### A-02. Elementos del menú móvil enfocables cuando están ocultos visualmente

- **Criterio relacionado:** WCAG 2.2, 2.4.3 Orden del foco y 2.4.7/2.4.11 foco visible y no oculto.
- **Evidencia:** `styles.css`, `.main-nav` en la media query de 760 px usa `transform: translateY(-150%)`; `index.html`, los cuatro enlaces dentro de `#main-nav` no reciben `hidden`, `inert` ni `tabindex` condicional.
- **Prueba:** a 320 px, con `aria-expanded="false"`, los cuatro enlaces tienen `tabIndex` 0 y el rectángulo de navegación queda fuera del viewport (`top` aproximado `-239 px`).
- **Impacto:** una persona que navega con Tab puede entrar en enlaces invisibles o perder la referencia espacial del foco.
- **Recomendación:** sincronizar el estado visual con el estado interactivo. Opciones válidas: usar `hidden`/`display: none` cuando el menú está cerrado, o aplicar `inert` y retirar los enlaces del orden de tabulación mientras esté cerrado; restaurar el foco al botón al cerrar.

### Medios

#### M-01. El nombre accesible del botón no refleja el estado abierto

- **Criterio relacionado:** WCAG 2.2, 4.1.2 Nombre, función, valor.
- **Evidencia:** `index.html`, `.menu-toggle` contiene el texto sr-only `Abrir menú`; `script.js`, `setMenuState` solo actualiza `aria-expanded`.
- **Prueba:** después de abrir el menú, `aria-expanded` pasa a `true`, pero el nombre accesible continúa siendo `Abrir menú`.
- **Impacto:** `aria-expanded` comunica el estado, pero el nombre resulta contradictorio para usuarios de lectores de pantalla.
- **Recomendación:** actualizar `aria-label` o el texto sr-only a `Abrir menú`/`Cerrar menú` según el estado. Mantener `aria-expanded` y `aria-controls`.

#### M-02. Datos biográficos y estadísticas sin semántica de lista o descripción

- **Criterio relacionado:** HTML semántico y WCAG 1.3.1 Información y relaciones.
- **Evidencia:** `index.html`, `.bio-details` y `.stats-grid` usan `div`, `span` y `strong` para pares etiqueta/valor y una colección de estadísticas.
- **Impacto:** la relación entre cada etiqueta y su valor no queda expresada tan claramente para tecnologías de asistencia.
- **Recomendación:** usar `dl` con `dt`/`dd` para los datos biográficos y una `ul` con `li` para las estadísticas. Si las tarjetas son visualmente más complejas, conservar el estilo CSS y mejorar solo la semántica.

#### M-03. Foco visible basado en lima no contrasta sobre el fondo claro

- **Criterio relacionado:** WCAG 2.2, 2.4.11 Foco no oculto y 1.4.11 Contraste no textual.
- **Evidencia:** `styles.css`, regla global `:focus-visible { outline: 3px solid var(--lime); }`.
- **Prueba:** el foco se muestra con `3px` en teclado, pero `--lime` sobre `--paper` tiene un ratio aproximado de **1.23:1**.
- **Impacto:** el foco es visible técnicamente, pero puede no distinguirse suficientemente en navegación clara.
- **Recomendación:** definir un color de foco oscuro para fondos claros o usar un doble anillo con colores que mantengan al menos 3:1 respecto al fondo y al componente adyacente.

#### M-04. Menú y botón móvil por debajo de la recomendación de 44 px

- **Criterio relacionado:** WCAG 2.2, 2.5.8 Tamaño del objetivo (mínimo AA de 24x24, salvo excepciones) y ergonomía táctil.
- **Evidencia:** `styles.css`, `.menu-toggle` mide aproximadamente 38x30 px en la prueba a 320 px. Los enlaces del menú usan solo `padding: .75rem 0`.
- **Resultado:** el botón supera el mínimo AA de 24x24, pero queda por debajo de 44x44, una referencia de usabilidad móvil ampliamente recomendable.
- **Recomendación:** aumentar el área del botón a un mínimo de 44x44 px y dar a los enlaces del menú una altura de línea/padding que facilite el toque sin depender solo del texto.

### Bajos

#### B-01. Imágenes y fuentes dependen de recursos externos

- **Evidencia:** `styles.css` importa Google Fonts y `index.html` enlaza imágenes de Wikimedia Commons.
- **Resultado:** en la prueba con conexión disponible, las tres imágenes cargaron después de desplazar la galería; sin conexión, la página depende de las fuentes de respaldo y las imágenes pueden quedar vacías.
- **Recomendación:** considerar fuentes locales o una estrategia explícita de fallback visual para imágenes. Mantener `alt` y revisar el estado de error si la galería se usa en un entorno sin red.

#### B-02. Falta de dimensiones intrínsecas en las imágenes

- **Evidencia:** `index.html`, los tres elementos `img` tienen `loading="lazy"` y `alt`, pero no `width`/`height` ni `aspect-ratio` HTML.
- **Impacto:** el navegador puede reservar menos información de diseño antes de descargar la imagen, lo que puede producir cambios de layout en otras composiciones o navegadores.
- **Recomendación:** añadir dimensiones proporcionales o definir explícitamente `aspect-ratio` en `.gallery-card img`/su contenedor, manteniendo `object-fit: cover`.

#### B-03. Uso de roles redundantes en la timeline

- **Evidencia:** `index.html`, `.timeline` usa `role="list"` y cada `article` usa `role="listitem"`.
- **Resultado:** es válido y no produce un error observado, pero introduce ARIA manual sobre elementos que ya podrían expresarse con HTML nativo.
- **Recomendación:** usar una `ul` con `li` si la timeline se considera una lista, o conservar los `article` sin roles si cada capítulo se trata como contenido independiente. Evitar ARIA redundante cuando el HTML nativo sea suficiente.

## 3. Evidencia concreta y criterios cumplidos

### Estructura semántica: cumple

- `index.html` contiene `header`, `nav`, `main` y `footer`.
- Las secciones tienen `aria-labelledby` y encabezados identificables.
- Existe un enlace de salto al contenido con `href="#contenido"`.

### Jerarquía de encabezados: cumple

- Hay un único `h1` para el nombre principal.
- Las secciones principales usan `h2` (`bio-title`, `journey-title`, `stats-title`, `gallery-title`, `cta-title`).
- No se observaron saltos de nivel en el árbol de encabezados probado.

### Nombres accesibles: cumple con la observación M-01

- La navegación tiene `aria-label="Navegación principal"`.
- La marca tiene `aria-label` descriptivo.
- Los botones de la timeline exponen año y club mediante su contenido textual.
- El botón móvil tiene `aria-expanded` y `aria-controls`, pero su texto no cambia al abrirse.

### Textos alternativos: cumple

- Hay tres imágenes con `alt` descriptivos y no vacíos.
- La prueba del navegador confirmó que las tres imágenes cargan cuando la galería entra en el viewport.
- Los iconos decorativos usan `aria-hidden="true"`.

### Enlaces y botones: cumple con la observación M-01

- Las acciones que navegan usan `a`; las acciones que cambian estado usan `button`.
- Los enlaces internos apuntan a `#biografia`, `#trayectoria`, `#estadisticas` y `#galeria`, y esos objetivos existen.
- Los enlaces externos usan `target="_blank"` con `rel="noopener noreferrer"`.
- La timeline se puede activar mediante teclado con `Enter`; el estado `aria-expanded` y el atributo `hidden` se sincronizan.

### JavaScript: cumple en las pruebas realizadas

- `node --check script.js` terminó sin errores.
- No se observaron errores de ejecución durante las pruebas del menú y la timeline.
- El código usa `defer`, espera a `DOMContentLoaded` y mantiene la lógica en funciones pequeñas.

### Responsive y overflow: cumple en las pruebas realizadas

| Resolución | Menú | Overflow horizontal | Resultado de imágenes |
|---|---|---:|---|
| 320 px | Versión móvil | No observado | Cargan al entrar en viewport |
| 398 px | Versión móvil | No observado | Cargan al entrar en viewport |
| 768 px | Navegación horizontal | No observado | Cargan al entrar en viewport |
| 1440 px | Navegación horizontal | No observado | Cargan al entrar en viewport |

La anchura de documento no superó la anchura de viewport en ninguna de las cuatro pruebas.

### Objetivos táctiles: cumplimiento parcial

- Los disparadores de la timeline ocupan toda la fila y superan ampliamente el mínimo de 24x24 px.
- El botón móvil mide aproximadamente 38x30 px: cumple el mínimo AA de 24x24, pero no alcanza 44x44 px.
- El menú abierto ofrece áreas de enlace razonables, aunque conviene aumentar su separación vertical.

## 4. Recomendación de corrección por hallazgo

1. Corregir primero A-01 con una paleta de texto que supere 4.5:1 para texto normal y 3:1 para texto grande.
2. Corregir A-02 haciendo que el menú cerrado no sea navegable mediante teclado ni lector de pantalla.
3. Corregir M-01 actualizando el nombre del botón móvil junto con `aria-expanded`.
4. Corregir M-03 con un estilo de foco que mantenga contraste suficiente sobre fondos claros y oscuros.
5. Mejorar M-02 usando `dl`/`dt`/`dd` y `ul`/`li` donde corresponda.
6. Mejorar M-04 ampliando el botón móvil y el espaciado de los enlaces.
7. Aplicar B-01 y B-02 si el sitio debe ser resistente a desconexiones o a cambios de red.
8. Revisar B-03 durante una futura limpieza semántica, sin cambiar el comportamiento actual.

## 5. Pruebas que deberían repetirse después de corregir los problemas

- Ejecutar axe o Lighthouse en las cuatro resoluciones y revisar especialmente contraste, landmarks, nombres accesibles y foco.
- Medir con una herramienta de contraste todos los estados normal, hover y focus.
- Con el menú cerrado, recorrer toda la página con `Tab` y confirmar que ningún enlace oculto recibe foco.
- Abrir y cerrar el menú con teclado y comprobar `aria-expanded`, nombre accesible, foco y tecla `Escape` si se añade esa interacción.
- Activar todos los capítulos de la timeline con `Enter` y `Space`, confirmando que solo un panel queda visible y que `aria-expanded` coincide con `hidden`.
- Probar 320, 398, 768 y 1440 px con zoom del navegador al 200% y 400% para detectar reflujo, truncamiento y overflow.
- Revisar la galería con red lenta, sin red y después de desplazarse hasta las imágenes.
- Ejecutar `node --check script.js` y una prueba de consola sin errores en navegador.
- Verificar que los enlaces internos cambian al destino correcto y que los externos se abren con relación segura.

## 6. Estado posterior a la corrección

Las siguientes recomendaciones quedan **resueltas**, relacionadas con cambios concretos y verificadas:

- **A-01:** se separaron los tonos de texto para fondos claros (`--gold` y `--lime`) de los acentos luminosos para fondos oscuros (`--gold-dark` y `--lime-light`). Los ratios medidos fueron 6.06:1, 7.02:1 y 8.64:1 en las combinaciones claras comprobadas.
- **A-02:** el menú móvil usa `hidden`, `tabIndex = -1` y estado sincronizado; al abrirse devuelve los enlaces a `tabIndex = 0`.
- **M-01:** el botón cambia entre `aria-label="Abrir menú"` y `aria-label="Cerrar menú"`.
- **M-02:** los datos biográficos usan `dl`/`dt`/`dd` y las estadísticas usan `ul`/`li`.
- **M-03:** el foco sobre fondos claros usa `--focus-light`, con ratio medido de 8.64:1; sobre fondos oscuros conserva el anillo claro.
- **M-04:** el botón móvil mide 44x44 px y los enlaces del menú tienen una altura mínima de 44 px.
- **B-03:** la timeline y las estadísticas usan listas HTML nativas, sin roles ARIA redundantes.

Estado parcial o pendiente:

- **B-01:** las imágenes y fuentes siguen siendo recursos externos; se conserva como riesgo de disponibilidad fuera de línea.
- **B-02:** se añadieron alturas estables por breakpoint a las tarjetas de galería para evitar cambios de layout y overflow, pero no se añadieron atributos HTML `width`/`height`; queda como mejora opcional pendiente.

La validación posterior confirmó `node --check script.js`, respuestas HTTP 200 para `index.html`, `styles.css` y `script.js`, cero errores de página, tres imágenes cargadas, enlaces internos válidos, menú móvil funcional, cierre con Escape, foco restaurado, timeline operativa mediante teclado y ausencia de overflow en 320, 398, 768 y 1440 px.
