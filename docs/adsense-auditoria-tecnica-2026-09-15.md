# Auditoría técnica de Game-DLE para AdSense

Fecha: 15 de septiembre de 2026. Sitio: https://game-dle.web.app. Hosting: Firebase.

## Alcance y evidencia

La auditoría inicial fue de solo lectura: código del repositorio, artefactos existentes en `dist/game-dle/browser` y respuestas HTTP públicas. No se ejecutó build ni deploy durante esa auditoría. Existían modificaciones locales del propietario, principalmente en MusicDLE; no se atribuyen a esta auditoría. La implementación posterior fue autorizada por el usuario.

**Confirmado** significa observado en código o respuestas HTTP. **Mejora** significa recomendación fundamentada, no incumplimiento probado. **Externo** significa que depende de la cuenta o de los sistemas de Google. No se tiene acceso al motivo interno de la revisión: el veredicto es una inferencia, no una garantía de aprobación.

## 1. ads.txt

El archivo fuente `public/ads.txt` contiene:

```text
google.com, pub-9225896761341125, DIRECT, f08c47fec0942fa0
```

El publisher coincide con `src/index.html` y `src/app/shared/config/adsense.config.ts`.

- `angular.json`: builder `@angular-devkit/build-angular:application`, salida `dist/game-dle`, assets `glob: **/*`, `input: public`.
- El build existente contiene `dist/game-dle/browser/ads.txt`, idéntico al original y sin BOM.
- `firebase.json`: `hosting.public` apunta a `dist/game-dle/browser`; las exclusiones no eliminan ads.txt.
- `package.json`: deploy construye antes de ejecutar `firebase deploy --only hosting`.
- `.github/workflows/firebase-hosting-merge.yml`: instala, construye y despliega el proyecto game-dle al canal live.

Pruebas públicas iniciales:

| URL | Respuesta |
| --- | --- |
| https://game-dle.web.app/ads.txt | HTTP 200; text/plain; línea correcta |
| https://game-dle.firebaseapp.com/ads.txt | HTTP 200; mismo contenido |
| http://game-dle.web.app/ads.txt | Redirección a HTTPS y archivo correcto |

Las solicitudes identificadas como Googlebot, Mediapartners-Google y AdsBot-Google también entregaron HTTP 200 y el texto correcto. Cambiar el User-Agent no equivale a demostrar un rastreo real de Google.

Firebase da prioridad a archivos estáticos de coincidencia exacta sobre rewrites. El catch-all inicial `** -> /index.html` no interceptaba ads.txt porque el archivo estaba publicado. Si faltara en otro build, ese fallback sí podría devolver HTML.

**Conclusión confirmada:** ads.txt estaba funcionando en ambos dominios Firebase. No hacía falta una ruta Angular ni un rewrite especial. Si el panel seguía diciendo «No encontrado», correspondía comprobar el dominio exacto registrado, publisher de la cuenta y solicitar actualización. Un dominio personalizado distinto requiere su propia comprobación.

Google indica que ads.txt es recomendado, no obligatorio; la actualización del panel puede tardar días, hasta un mes con pocas solicitudes. Corregir el estado del panel no resuelve por sí mismo «Contenido de bajo valor».

## 2. Estructura inicial del sitio

`src/app/app.routes.ts` define 24 páginas canónicas, `/home` como alias y un wildcard. Las 24 devolvieron HTTP 200, título distinto, una meta description y canonical propia correcta. `/home` respondió 301 hacia `/`.

| Ruta | Contenido inicial observado |
| --- | --- |
| / | Catálogo con enlaces reales, descripciones y explicación editorial del proyecto |
| /lol | Introducción breve y catálogo de modos LoL |
| /futbol | Introducción breve y catálogo de fútbol |
| /acerca-de | Autor, objetivo, trabajo, independencia y contacto |
| /privacidad | Almacenamiento, Firebase, publicidad, cookies y YouTube |
| /terminos | Uso, exactitud, propiedad intelectual y servicios externos |
| /contacto | Correo real, responsable, perfiles y motivos de contacto |
| /games/wordle | Bloque editorial de aproximadamente 267 palabras |
| /games/clave-extrema | Bloque editorial de aproximadamente 263 palabras |
| /games/futboldle | Bloque editorial de aproximadamente 214 palabras |
| /games/onepiecedle | Bloque editorial de aproximadamente 237 palabras |
| /games/loldle | Bloque editorial de aproximadamente 228 palabras |
| /games/lol-who | Aproximadamente 36 palabras en el área principal; sin bloque editorial |
| /games/lol-memory | Aproximadamente 29 palabras en el área principal; sin bloque editorial |
| /games/lol-timeline | Aproximadamente 31 palabras en el área principal; sin bloque editorial |
| /games/lol-connections | Aproximadamente 44 palabras incluyendo mensaje de datos insuficientes |
| /games/musicdle | Bloque editorial de aproximadamente 228 palabras y error de catálogo |
| /games/serpentile | Bloque editorial de aproximadamente 220 palabras |
| /games/tuttifrutti | Entrada multijugador y bloque editorial de aproximadamente 236 palabras |
| /games/geodle | Bloque editorial de aproximadamente 224 palabras y error de catálogo |
| /games/chronodle | Bloque editorial de aproximadamente 218 palabras |
| /games/palmodle | Bloque editorial de aproximadamente 240 palabras |
| /games/rankdle | Bloque editorial de aproximadamente 215 palabras |
| /games/roscodle | Bloque editorial de aproximadamente 213 palabras |

Los conteos son orientativos; no son un umbral de AdSense. En los cuatro modos nuevos de LoL se excluyó la navegación global.

`src/app/shared/components/game-editorial-content/game-editorial-content.component.ts` concentra textos específicos de trece juegos. Su template muestra introducción, reglas, metodología, pistas, referencias, FAQ y enlaces relacionados. Reutilizar el template no implica duplicación: no se encontraron artículos enteros idénticos cambiando solamente el nombre. Las respuestas de `<details>` ya están en HTML y no se generan recién al abrirlas.

## 3. Contenido de bajo valor: hallazgos

### Cuatro modos LoL con contenido inicial escaso — confirmado

Archivos: `src/app/games/lol-shared/lol-game-shell.component.{ts,html}` y componentes `lol-memory`, `lol-timeline`, `lol-who`, `lol-connections`.

El shell tiene título, una instrucción breve, puntos, rondas y controles. No incluye fuentes, metodología, FAQ desarrolladas ni explicaciones independientes. Los cuatro componentes evitan cargar campeones en servidor. Conexiones termina publicando «No hay suficientes datos para crear este tablero». Esto no prueba que estén rotos en navegador, pero sí que sus páginas iniciales son débiles. No se detectaron unidades manuales en esos modos.

### Errores publicados de GeoDLE y MusicDLE — confirmado

Producción entregó repetidamente «No pudimos abrir el atlas. Recargá la página para intentarlo otra vez» y «No pudimos cargar el catálogo musical. Intenta recargar la página» dentro del HTML inicial.

Archivos: `src/app/games/geodle/geodle.component.ts:49`, `src/app/games/musicdle/musicdle-catalog.service.ts:13`, `src/app/games/musicdle/musicdle.component.ts:108`, templates correspondientes y configuración de servidor.

Los JSON sí responden HTTP 200: 195 países, 504 registros musicales en producción y 173 campeones. No son assets ausentes. La causa probable es la resolución de catálogos durante prerender y la diferencia entre builds. El dist local no contenía esos errores; no acreditaba su corrección en producción. Hosting estático entrega el error ya incorporado al archivo.

### Explicación de GeoDLE inconsistente — confirmado

El contenido editorial describe distancia geodésica y rumbo hacia el país. `src/app/games/geodle/geodle-engine.service.ts` compara continente, subregión, hemisferios, idiomas, superficie, población y fronteras; sus flechas indican mayor o menor valor, no rumbo. El catálogo y `scripts/update-geodle-catalog.mjs` identifican countries.dev como fuente. La página menciona Banco Mundial, UN M49 y Natural Earth sin explicar su relación con el catálogo efectivo. No se puede afirmar que nunca fueran consultados; sí falta precisión.

### Contenido educativo detrás de interacción — confirmado

`chronodle.component.html` publica resúmenes históricos y fuentes individuales al dejar el estado playing. `rankdle.component.html` revela notas, cifras y fuente al finalizar la ronda. Los datos y fuentes existen en `chronodle.data.ts` y `rankdle.data.ts`, pero no tenían páginas de lectura independientes. No conviene depender de que un crawler complete partidas.

### Profundidad y trazabilidad — mejora

Los bloques suelen tener tres reglas y dos FAQ. Wordle explica tildes de forma poco concreta; One Piece no precisa el alcance del catálogo; varias referencias enlazan portales generales. El modelo `palmodle.models.ts` no registra fuente por persona. Esto justifica mejorar profundidad y trazabilidad, pero no prueba datos falsos, copia de textos o generación automática sin revisión.

## 4. SEO e indexabilidad

Elementos correctos inicialmente:

- 24 títulos distintos, una descripción y una canonical correcta por página.
- `lang=es`; canonical principal https://game-dle.web.app.
- `public/robots.txt`: HTTP 200, permite todo el sitio.
- `public/sitemap.xml`: HTTP 200, contiene las 24 rutas, sin faltantes o extras.
- `public/sitemap-pages.txt`: HTTP 200; sitemap alternativo redundante.
- Sin noindex observable en las 24 respuestas iniciales.
- Tarjetas y menús generan enlaces HTML con href; no se detectaron rutas de juegos huérfanas ni login obligatorio para acceder a páginas públicas.
- Prerender estático real: `angular.json` usa server y outputMode static; `app.config.server.ts` provee render de servidor; `main.server.ts` adapta localStorage.

Aunque src/index.html tenga app-root vacío, el HTML final publicado incluye contenido. JavaScript es necesario para partidas, buscadores, reproductores y salas; no para todo el contenido editorial e institucional. No existe servidor SSR por petición en Firebase Hosting.

Problemas confirmados:

- `layout.component.html:63` usa H1 para la marca global; muchas páginas tienen además uno propio.
- Wordle y Clave Extrema usan H2 para su nombre, sin H1 específico.
- LoL DLE, One Piece DLE y MusicDLE publican un H1 adicional vacío. `base-game.component.html:22` usa game?.name, sin recibir explícitamente el juego del padre.
- Una URL inexistente devolvió exactamente la portada con HTTP 200 y canonical raíz. Responsables: catch-all de Firebase y wildcard Angular. Riesgo de soft 404 y duplicados.
- `/index.csr.html` responde HTTP 200 con shell vacío, aunque no se encontró enlazado ni en sitemap. Riesgo secundario.

No se acreditaron estados de Search Console, canonical elegida por Google, indexación efectiva ni Core Web Vitals con la auditoría de código. Los HTTP 200 no prueban indexación.

## 5. Legales y confianza

`src/app/pages/site-info/site-info.component.html` contiene Acerca de, Privacidad, Términos y Contacto. Las cuatro están publicadas, tienen responsable real y textos específicos. `footer.component.html` las enlaza permanentemente.

Excepción confirmada: `tuttifrutti.component.html` no incluye footer común. En el HTML inicial solo se encontró enlace a Términos desde el bloque editorial. Faltaban Privacidad, Contacto y Acerca de, especialmente relevantes para un modo que procesa nombres y respuestas multijugador.

Consentimiento externo: el script de AdSense carga globalmente y AdSlotComponent solicita anuncios al inicializarse, sin condición propia de consentimiento. No se encontró CMP explícita, pero una integración configurada desde AdSense no puede descartarse con el repositorio. La promesa de solicitar consentimiento en Privacidad no demuestra que esté activa. Para anuncios personalizados en EEE, Reino Unido y Suiza se requiere CMP certificada de acuerdo con Google.

No se encontraron unidades manuales en legales, hubs, cuatro modos LoL nuevos, Tutti Frutti ni Palmó Primero. Otras rutas tenían una unidad manual. No hay base para afirmar tres anuncios por juego actualmente. Los anuncios automáticos de la cuenta y permisos sobre recursos de terceros requieren comprobación externa.

## 6. Plan priorizado

P0 significa resolver antes de otra revisión por su impacto potencial, no bloqueo individual confirmado por Google.

| Prioridad | Archivo/ruta | Problema e impacto | Cambio recomendado |
| --- | --- | --- | --- |
| P0 confirmado | GeoDLE, MusicDLE, servicios y servidor | Errores de catálogo en HTML publicado | Resolver datos locales en prerender y validar build y producción |
| P0 confirmado | Cuatro modos LoL y shell | Muy poco texto inicial, error aparente | Contenido específico visible y separar estado inicial de error |
| P0 externo | Cuenta AdSense y ads.txt | Panel contradice HTTP verificados | Verificar dominio, publisher y solicitar actualización |
| P0 condicional | index.html, AdSlot y cuenta | Consentimiento efectivo no acreditado | Comprobar CMP y completar integración si falta |
| P1 confirmado | Editorial y motor GeoDLE | Reglas y fuente inconsistentes | Explicar atributos reales, flechas, tolerancias y fuente efectiva |
| P1 confirmado | firebase.json, app.routes.ts | Desconocidas con portada y 200 | 404 real conservando deep links estáticos |
| P1 confirmado | Tutti Frutti | Legales no enlazadas permanentemente | Footer común |
| P1 confirmado | Layout y BaseGame | H1 global, vacíos y H2 para nombre | H1 descriptivo por página y título explícito |
| P1 mejora | ChronoDLE y RankDLE | Información requiere terminar ronda | Archivo público, ejemplos y referencias independientes |
| P1 mejora | Editorial y catálogos | Fuentes generales, poca profundidad | Reglas precisas, alcance y trazabilidad |
| P1 mejora | Workflow de deploy | Build puede publicar estados de error | Validación automática del HTML y de Hosting |
| P2 mejora | /lol, /futbol | Catálogos con introducción breve | Orientación original, comparación de modos |
| P2 mejora | index.csr.html | Shell vacío público | Excluir si no es necesario |
| P2 mejora | Sitemap y docs | Duplicación y diagnóstico histórico | Una fuente de sitemap y documentación actualizada |
| P2 externo | Search Console, móvil, terceros | Estados no acreditados | Inspección, pruebas y registro de derechos |

## 7. Contenido adicional propuesto

Primero completar cuatro modos LoL; luego aprovechar datos y mecánicas reales.

- `/como-jugar`: diarios, rondas libres, salas, progreso y elección de juego.
- `/guias`: índice de guías.
- `/guias/wordle-letras-repetidas`: ejemplos de conteo y normalización.
- `/guias/clave-extrema`: deducciones con Exactas, Movidas y Fuera.
- `/guias/geodle`: atributos efectivamente implementados.
- `/guias/serpentile`: giros, conexiones y ejemplos.
- `/guias/tuttifrutti`: salas, votación y puntuación real.
- `/historia`: archivo explicativo basado en ChronoDLE, sin exigir jugar.
- `/rankings/:categoria`: valores, criterios y fuentes de RankDLE.
- `/metodologia`: procedencia, normalización, alcance y mantenimiento.
- `/preguntas-frecuentes`: almacenamiento, cuentas, salas, audio y desafíos.

No duplicar Acerca de con otra ruta Sobre. No publicar fichas masivas de nombre, cifra e imagen como sustituto de explicación y fuentes. No afirmar que una cantidad de páginas, palabras o visitas garantiza aprobación.

## Veredicto inicial

La explicación probable del rechazo es cobertura editorial desigual, contenido útil detrás de partidas y presentación inicial incompleta en varias rutas. Cuatro modos LoL casi sin contenido propio, errores publicados en GeoDLE/MusicDLE y guía GeoDLE desactualizada son evidencias concretas. No había carencia general de legales, metadatos, sitemap, enlaces o prerender. La versión revisada por Google y sus factores internos no se pueden conocer por el repositorio.

ads.txt debía funcionar y estaba funcionando en ambos dominios Firebase. Su estado en el panel es independiente de «Contenido de bajo valor».

## Referencias oficiales

- https://support.google.com/adsense/answer/12171612?hl=es — ads.txt, publicación y actualización del estado.
- https://firebase.google.com/docs/hosting/full-config?hl=es-419 — prioridad de estáticos, redirects y rewrites.
- https://support.google.com/publisherpolicies/answer/11112688?hl=es — contenido del editor y valor del inventario.
- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics — prerender, enlaces, canonical y soft 404.
- https://support.google.com/adsense/answer/13554116?hl=es — CMP para anuncios personalizados en EEE, Reino Unido y Suiza.
- https://support.google.com/adsense/answer/48182?hl=es — políticas del programa.

## Ejecución autorizada después de la auditoría

**Estado: correcciones implementadas y publicadas en https://game-dle.web.app el 15 de septiembre de 2026.** La auditoría anterior se conserva como diagnóstico de la versión inicial; esta sección describe el resultado después de la autorización de cambios.

### Cambios aplicados

| Prioridad del plan | Resultado | Archivos concretos |
| --- | --- | --- |
| P0 catálogos | Prerender obtiene copias independientes de JSON locales; GET externos y escrituras conservan su transporte normal | `src/app/prerender-catalog.interceptor.ts`, `src/app/app.config.server.ts`, `tsconfig.json` |
| P0 cuatro modos LoL | Catálogo disponible en servidor; reglas, metodología, pistas, referencias, FAQ y guías visibles antes de jugar | `src/app/games/lol-{who,memory,timeline,connections}`, `src/app/games/lol-shared/lol-game-shell.component.*`, `src/app/shared/components/game-editorial-content/lol-editorial-content.ts` |
| P0 publicidad condicional | Solicitudes deshabilitadas y script global retirado; publisher, meta y ads.txt conservados | `src/index.html`, `src/app/shared/config/adsense.config.ts`, `src/app/shared/components/ad-slot`, `src/app/pages/site-info/site-info.component.html` |
| P1 exactitud | GeoDLE explica atributos/flechas/tolerancias reales, Wordle Ñ→N y Serpentile avance/objetivos/puntaje; Tutti Frutti explica mayoría estricta | `game-editorial-content.component.ts`, `src/app/pages/knowledge/knowledge.data.ts` |
| P1 H1 | Marca deja de ser encabezado; títulos explícitos en wrappers; H1 específico en Wordle y Clave Extrema | `layout.component.html`, `base-game.component.*`, wrappers LoL/One Piece/MusicDLE, templates Wordle/Clave Extrema |
| P1 enlaces legales | Footer completo también en Tutti Frutti; biblioteca enlazada desde portada, hubs y pie global | `tuttifrutti.component.*`, `footer.component.html`, `home.component.html`, `game-universe.component.html` |
| P1 datos públicos | Historia y ocho categorías de rankings publican contexto, resúmenes/valores y referencias sin completar rondas | `src/app/pages/knowledge/knowledge.component.*`, `knowledge.data.ts` |
| P1 404 | Desconocidas devuelven HTTP 404 real, página de ayuda noindex y navegación Angular equivalente | `firebase.json`, `public/404.html`, `src/app/pages/not-found`, `app.routes.ts`, `route-metadata.service.ts` |
| P1 deploy | Controles automáticos de HTML, catálogos, rutas y producción; tests integrados en workflow | `scripts/prepare-site.mjs`, `scripts/validate-site.mjs`, `package.json`, `.github/workflows/firebase-hosting-merge.yml` |
| P2 fuentes únicas | Rutas y sitemap comparten manifest; resumen de catálogo se regenera en build; sitemap redundante retirado | `src/app/public-pages.json`, `src/app/catalog-summary.json`, `public/sitemap.xml`, `public/robots.txt` |
| P2 shell y configuración | Shell CSR excluido de Hosting; _redirects de otro proveedor retirado, sin efecto previo sobre Firebase | `firebase.json`, eliminación de `public/_redirects` |
| P2 documentación | Plan histórico reemplazado por estado vigente, operación publicitaria y registro de procedencia | `docs/adsense-contenido-bajo-valor-plan.md`, `docs/adsense-setup.md`, `docs/recursos-terceros.md` |

One Piece además evita ejecutar fetch relativo de arcos en el servidor (`onepiece-game.service.ts`). Se conservaron las modificaciones locales previas del propietario en MusicDLE y estilos.

### Nuevas páginas publicadas

Son 23 nuevas páginas sobre las 24 existentes, total 47 canónicas. `/home` es un alias, no una página adicional en sitemap. El build informa 48 rutas estáticas porque también genera ese alias.

- `/como-jugar`, `/guias`, `/historia`, `/rankings`, `/metodologia`, `/preguntas-frecuentes`.
- `/guias/wordle-letras-repetidas`, `/guias/clave-extrema`, `/guias/geodle`, `/guias/serpentile`, `/guias/tuttifrutti`.
- `/guias/lol-who`, `/guias/lol-memory`, `/guias/lol-timeline`, `/guias/lol-connections`.
- `/rankings/planetas-diametro`, `/rankings/montanas-altura`, `/rankings/paises-superficie`, `/rankings/elementos-atomicos`.
- `/rankings/rascacielos-altura`, `/rankings/videojuegos-lanzamiento`, `/rankings/animales-peso`, `/rankings/peliculas-duracion`.

La biblioteca combina ejemplos originales basados en motores reales y archivos existentes. No duplica Acerca de ni genera fichas vacías por cada entidad. Los enlaces bibliográficos heredados se publican como referencias de consulta: no se declara una nueva verificación factual de cada valor. «Información revisada» en el bloque editorial reemplaza «Catálogo revisado» para no equiparar revisión de reglas con comprobación exhaustiva de datos.

### Validación realizada

| Comprobación | Resultado |
| --- | --- |
| Build de producción y postbuild | Correctos; 48 rutas estáticas, 47 canónicas |
| Suite completa con Chrome Headless 153 | 165 pruebas correctas, cero fallos |
| Catálogo GeoDLE | 195 países, válido |
| Catálogo MusicDLE local publicado | 584 canciones habilitadas, válido; la cifra inicial de producción correspondía a la versión anterior |
| Publicación Firebase | Despliegue Hosting completado en proyecto game-dle |
| Validación HTTP de las 47 páginas | HTTP 200, title único, canonical exacta, descripción, H1 principal no vacío, sin noindex |
| Contenido y enlaces iniciales | Editorial presente en los 17 juegos; cuatro legales enlazadas en todas las páginas; enlaces internos resueltos; sin los mensajes de error de catálogo detectados inicialmente |
| Sitemap y robots | 47 URLs coinciden con manifest; rastreo permitido y una declaración de sitemap |
| ads.txt publicado | HTTP 200, Content-Type text/plain, línea exacta de publisher |
| URL inexistente y shell CSR | HTTP 404; respuesta noindex; index.csr.html ya no publicado |
| /home | HTTP 301 hacia / |
| Navegador real aislado, con JavaScript | Guía GeoDLE, Metodología y Conexiones LoL a 390 px; índice de guías a 1365 px; H1/canonical correctos y sin script de anuncios ni desbordamiento horizontal |

La suite inicial detectó un test de marca que esperaba el H1 retirado y un fixture de footer sin router. Se corrigieron sus expectativas/proveedores, además de añadir cobertura del manifest, enlaces del footer e independencia/delegación de catálogos. La repetición completa pasó. Puede reproducirse con `npm run test:ci`, usando CHROME_BIN si Chrome no se detecta automáticamente.

Evidencia local: `audit-build.log`, `audit-tests.log` y capturas en `audit-artifacts/`, que también contiene perfiles aislados de Chrome usados únicamente para estas pruebas. La limpieza fue rechazada por la revisión automática con «blocked by policy», sin motivo más específico. Se conservan fuera del seguimiento de Git mediante `.gitignore`; no se publican en Hosting ni afectan al producto.

El build conserva advertencias de tamaño: paquete inicial aproximadamente 769 kB frente a aviso de 750 kB; siete hojas de componentes superan aviso de 8 kB, todas por debajo del máximo de error de 12 kB. También existe aviso CommonJS de faye-websocket dentro de Firebase. No se elevaron presupuestos para ocultarlos. No prueban un bloqueo de AdSense; una optimización posterior y medición de Core Web Vitals puede abordarlas. La revisión de 390 px no equivale a probar todas las pantallas, dispositivos y funciones del sitio.

### Acciones externas que no se pueden declarar completadas

El usuario confirmó `game-dle.web.app` como dominio exacto de AdSense. Firebase CLI tenía sesión y permitió desplegar. La herramienta de navegador devolvió explícitamente «No browser is available» al intentar acceder a AdSense: no hay acceso operativo a AdSense ni Search Console en esta sesión.

| Acción | Estado y siguiente paso concreto |
| --- | --- |
| Actualización de ads.txt en AdSense | Archivo verificado públicamente; abrir entrada game-dle.web.app y solicitar nueva comprobación desde la cuenta |
| Nueva revisión por contenido | Abrir la entrada del sitio y solicitar revisión de la versión ya publicada; la aprobación depende de Google |
| CMP de publicidad | No acreditada; configurar/probar CMP certificada aplicable y sus preferencias antes de reactivar anuncios. Pasos en `docs/adsense-setup.md` |
| Search Console | Enviar sitemap.xml e inspeccionar raíz, cuatro modos LoL, GeoDLE, MusicDLE y biblioteca; indexación efectiva no acreditada |
| Permisos de recursos | Inventario realizado en `docs/recursos-terceros.md`; faltan evidencias externas de autorización por recurso cuando corresponda |
| Biografías y cifras | Palmó Primero no registra fuente por persona; referencias heredadas de otros catálogos no equivalen a verificación exhaustiva. Registrar fuentes concretas verificadas al revisar esos datos, sin fabricar permisos ni fechas de consulta |

No se afirma «todo completado» respecto de estas acciones ni se confunde un despliegue exitoso con aprobación o indexación. Las correcciones técnicas y ampliaciones editoriales implementadas están publicadas y verificadas.

### Veredicto después de la implementación

Se resolvieron los errores iniciales de presentación y la falta de cobertura de cuatro modos LoL, se hicieron públicos archivos educativos y se reforzaron contenido, navegación, exactitud y controles de despliegue. El sitio ofrece ahora 47 páginas canónicas con HTML inicial significativo. Esto mejora las evidencias concretas que sustentaban el diagnóstico de bajo valor; no permite conocer ni garantizar el resultado de la próxima revisión.

**ads.txt funcionaba antes de los cambios y sigue funcionando después del despliegue.** Si el panel continúa mostrando «No encontrado», corresponde revisar su rastreo y estado en AdSense, no añadir un rewrite hacia index.html ni cambiar el publisher sin comprobar la cuenta.
