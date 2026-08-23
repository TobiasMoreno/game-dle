# Roadmap de mejoras UX de Game-DLE

> Estado: implementación completada; validación manual pendiente  
> Última revisión: 2026-08-23  
> Alcance analizado: home, navegación global, presentación del catálogo, estados diarios, accesibilidad, rendimiento percibido y consistencia entre juegos.

## 1. Objetivo

Hacer que Game-DLE ayude al usuario a responder rápidamente tres preguntas:

1. ¿Qué puedo jugar hoy?
2. ¿Qué partida debería continuar o empezar ahora?
3. ¿Qué progreso llevo y cuándo se renueva?

La mejora debe conservar la personalidad visual de cada juego y simplificar la capa que los organiza.

## 2. Criterios generales de éxito

- La primera acción jugable aparece en el primer viewport de la home, tanto en móvil como en escritorio.
- Los juegos diarios, ilimitados y multijugador se distinguen sin leer descripciones largas.
- Cada juego muestra un estado inequívoco: `Jugar`, `Continuar`, `Completado`, `Ver resultado` u `Otra ronda`.
- Todo el producto utiliza la medianoche de Argentina como límite del día.
- La navegación principal puede operarse con teclado, lector de pantalla y dispositivo táctil.
- La home mantiene una identidad visual propia y coherente con los juegos más elaborados.
- La carga inicial no descarga innecesariamente todos los juegos y sus recursos.

## 3. Alcance

### Incluido

- Jerarquía y arquitectura de información de la home.
- Agrupación, orden y presentación de los juegos.
- Bitácora diaria, racha, autenticación y progreso.
- Header, sidebar y navegación de regreso al inicio.
- Estados de juego y vocabulario común.
- Accesibilidad de navegación y tarjetas.
- Rendimiento percibido y estrategia de precarga.
- Dirección visual de la plataforma.

### Fuera de alcance por ahora

- Rediseñar la mecánica interna de cada juego.
- Cambiar reglas, catálogos o dificultad.
- Reemplazar las identidades visuales particulares de GeoDLE, ChronoDLE, RankDLE, RoscoDLE u otros juegos.
- Modificar la estrategia de monetización; sólo se contempla su ubicación dentro de la jerarquía UX.

## 4. Hallazgos observados en la línea base

Los puntos de esta sección describen el comportamiento previo a la implementación y se conservan para trazabilidad. El estado actual se registra en las fases y el backlog.

### UX-01 — La acción principal queda demasiado abajo

En `src/app/pages/home/home.component.html`, la home renderiza antes del catálogo:

1. Título y descripción.
2. Bitácora diaria completa.
3. Bloque de novedades.
4. Grilla de juegos.

Esto prioriza información secundaria sobre la intención principal de jugar.

### UX-02 — Todos los juegos compiten con la misma importancia

Los juegos se muestran en una sola grilla y en el orden de `GameManagerService.availableGames`. No existen agrupaciones visuales por modo, duración, temática o estado.

Modos actuales:

- Diarios: Wordle, One Piece DLE, LoL DLE y Serpentile.
- Ilimitados: MusicDLE, GeoDLE, ChronoDLE, FutbolDLE, RankDLE y RoscoDLE.
- Multijugador ilimitado: Tutti Frutti.

### UX-03 — Existen varias capas de navegación superpuestas

Conviven:

- Header global en `src/app/layout/layout.component.html`.
- Sidebar global.
- Header de `BaseGameComponent`.
- Botones `app-back-home-button` dentro de distintos juegos.
- Cabeceras propias en juegos con `hideHeader=true`.

El resultado es una navegación inconsistente entre rutas y duplicación de elementos.

### UX-04 — El concepto de “día” no tiene una única fuente de verdad

La bitácora utiliza `argentinaDateKey()` y muestra un contador hasta medianoche de Argentina. Sin embargo, otras áreas utilizan `new Date().toISOString().split('T')[0]`, entre ellas:

- `GameManagerService`.
- `GameStorageService`.
- `BaseGameService`.
- `BaseGameComponent`.
- Serpentile.

Esto puede hacer que progreso, racha y disponibilidad cambien antes de la medianoche local.

### UX-05 — Los estados no representan correctamente todos los tipos de juego

- El sidebar presenta resultados diarios en formato `intentos/6`, aunque Serpentile funciona por puntaje.
- La home y el sidebar calculan y redactan los estados por separado.
- El texto informativo del sidebar sólo identifica a MusicDLE y GeoDLE como ilimitados, aunque existen más modos ilimitados.
- Estadísticas, actividad diaria y estados persistidos provienen de fuentes diferentes.

### UX-06 — Hay controles no semánticos o incompletos

- Las tarjetas de la home son `div` con evento de clic, no enlaces.
- Los controles de apertura y cierre del sidebar no exponen todo su estado mediante ARIA.
- El sidebar móvil no ofrece overlay, cierre por Escape ni una estrategia visible de gestión de foco.
- La personalidad de varias tarjetas sólo aparece en `hover`, interacción inexistente en dispositivos táctiles.

### UX-07 — La home y los juegos hablan lenguajes visuales diferentes

La home utiliza una grilla genérica gris/blanca con tipografía de sistema. En cambio, varios juegos cuentan con direcciones editoriales reconocibles. La calidad visual está concentrada dentro de las partidas, no en la experiencia que permite descubrirlas.

### UX-08 — La precarga reduce el beneficio de las rutas lazy

`app.config.ts` utiliza `withPreloading(PreloadAllModules)`. Después del arranque, el navegador puede descargar todos los juegos aunque el usuario sólo vaya a jugar uno.

## 5. Principios de diseño propuestos

1. **Jugar antes que administrar:** la siguiente acción jugable siempre tiene prioridad sobre estadísticas, autenticación, novedades y ayuda.
2. **Estado antes que descripción:** `Continuar` o `Completado` debe poder reconocerse antes de leer qué hace el juego.
3. **Una plataforma, múltiples mundos:** el shell es consistente; cada juego conserva su propia identidad.
4. **Progreso bajo demanda:** racha y avance diario se resumen; calendario, insignias y sincronización se expanden cuando el usuario los solicita.
5. **El modo define la expectativa:** diario, ilimitado y multijugador deben verse y redactarse de forma diferente.
6. **Acciones semánticas:** navegar usa enlaces; cambiar estado usa botones.
7. **Touch y teclado son casos principales:** ninguna información importante depende exclusivamente del hover.

## 6. Arquitectura propuesta para la home

Orden recomendado:

```text
Header compacto
└── Logo · progreso de hoy · tema · menú

Siguiente partida
└── Continuar progreso > diario pendiente > ilimitado recomendado

Resumen de bitácora
└── Racha · progreso diario · reinicio · abrir detalle

Catálogo por modalidad
├── Desafíos de hoy
├── Rondas ilimitadas
└── Con amigos

Publicidad
Ayuda compacta y footer
```

### Regla para “Siguiente partida”

Aplicar la primera condición disponible:

1. Juego con progreso incompleto: `Continuar partida`.
2. Primer desafío diario pendiente: `Jugar desafío de hoy`.
3. Todos los diarios completados: `Seguir jugando` con un modo ilimitado.
4. Usuario nuevo: mostrar el juego diario de entrada definido por producto.

### Tarjeta de juego propuesta

Contenido mínimo:

- Nombre e identidad visual.
- Etiqueta de modo: `Diario`, `Sin límite` o `Con amigos`.
- Descripción de una línea.
- Estado principal.
- CTA explícito.

Contenido opcional:

- Duración estimada.
- Puntaje o intentos del día.
- Etiqueta `Nuevo`.

Evitar mostrar estadísticas históricas completas en cada tarjeta.

## 7. Navegación propuesta

### Header global

- Logo enlazado a inicio.
- En una partida: nombre del juego o breadcrumb compacto.
- Resumen corto del progreso diario.
- Tema y menú de utilidades.
- “Apoyar” puede mantenerse visible en escritorio y pasar al menú en móvil.

### Sidebar o drawer

- Usar categorías iguales a las de la home.
- Marcar la ruta activa.
- Ancho explícito.
- Scroll interno.
- Overlay en móvil.
- Cierre por Escape, clic exterior y navegación.
- Bloqueo de scroll del documento mientras está abierto en móvil.
- Foco inicial en el botón de cierre y restauración al disparador.
- `aria-expanded`, `aria-controls` y nombres accesibles.

### Dentro de cada juego

- Mantener un único mecanismo de regreso.
- Eliminar duplicación entre header global, header de `BaseGame` y botones internos.
- Conservar ayuda contextual, compartir, nueva ronda y estadísticas cerca del momento en que resultan útiles.

## 8. Sistema común de estados

Crear una representación única derivada del tipo de juego y su estado persistido.

| Tipo | Estado | Etiqueta recomendada | CTA |
|---|---|---|---|
| Diario por intentos | Sin jugar | Disponible hoy | Jugar |
| Diario por intentos | En progreso | Intento N de M | Continuar |
| Diario por intentos | Ganado | Completado en N | Ver resultado |
| Diario por intentos | Perdido | Completado hoy | Ver resultado |
| Diario por puntaje | Sin jugar | Disponible hoy | Jugar |
| Diario por puntaje | Completado | N puntos hoy | Ver resultado |
| Ilimitado | Sin progreso | Rondas ilimitadas | Jugar |
| Ilimitado | En progreso | Partida en curso | Continuar |
| Ilimitado | Finalizado | Última ronda: resultado | Otra ronda |
| Multijugador | Sin sala | Con amigos | Crear o unirse |
| Multijugador | En sala | Sala activa | Volver a la sala |

La home, el sidebar y las páginas de juego deben consumir esta misma representación.

## 9. Roadmap de implementación

### Fase 0 — Consistencia funcional

Objetivo: evitar que la nueva interfaz presente información incorrecta.

- [x] Reemplazar cálculos UTC del día lógico por `argentinaDateKey()` donde corresponda.
- [x] Revisar lectura, guardado, reseteo y migración del progreso existente.
- [x] Definir un modelo común para estados de presentación.
- [x] Incluir soporte específico para juegos diarios por puntaje.
- [x] Corregir la descripción de modos ilimitados del sidebar.
- [x] Agregar pruebas alrededor de las 20:59, 21:00, 23:59 y 00:00 de Argentina.

Definición de terminado:

- Una partida completada antes de medianoche permanece completada hasta las 00:00 de Argentina.
- Home, sidebar y juego muestran el mismo estado.
- Serpentile nunca presenta una fracción ficticia de seis intentos.

### Fase 1 — Home orientada a jugar

Objetivo: mostrar una acción relevante en el primer viewport.

- [x] Crear selector de “siguiente partida”.
- [x] Dividir los juegos en diarios, ilimitados y multijugador.
- [x] Añadir CTA explícito a cada tarjeta.
- [x] Sustituir tarjetas clicables por enlaces semánticos.
- [x] Convertir la bitácora en resumen compacto.
- [x] Mover autenticación, calendario e insignias al detalle expandido.
- [x] Retirar el bloque prominente de Novedades y usar etiquetas sobre juegos.
- [x] Mantener publicidad fuera del camino entre recomendación y juego.

Definición de terminado:

- Móvil y escritorio muestran al menos una acción de juego sin hacer scroll.
- Todos los juegos son accesibles desde categorías claras.
- La navegación funciona con clic, toque, Enter y barra espaciadora según el elemento.

### Fase 2 — Shell y navegación consistentes

Objetivo: que cambiar de juego no implique aprender una navegación nueva.

- [x] Definir qué responsabilidades conserva el header global.
- [x] Eliminar botones de regreso duplicados.
- [x] Corregir ancho y desplazamiento del sidebar.
- [x] Añadir estado activo y agrupación por modo.
- [x] Implementar drawer móvil accesible.
- [x] Probar foco, Escape, lector de pantalla y bloqueo de scroll.

Definición de terminado:

- Todas las rutas ofrecen el mismo patrón de regreso.
- No existen dos controles equivalentes visibles al mismo tiempo.
- El drawer cumple navegación por teclado y conserva el contexto al cerrarse.

### Fase 3 — Identidad visual de plataforma

Objetivo: elevar la home al nivel visual de los juegos sin borrar sus diferencias.

- [x] Definir tokens globales de color, tipografía, espaciado, borde y elevación.
- [x] Diseñar tarjetas con una base compartida y acento propio por juego.
- [x] Hacer visibles los acentos en touch, no sólo en hover.
- [x] Diseñar estados de carga con dimensiones estables.
- [x] Normalizar foco visible, estados disabled y `prefers-reduced-motion`.
- [x] Revisar contraste en modo claro y oscuro.

Dirección sugerida: **almanaque arcade diario**. Base editorial cálida, estados presentados como sellos o fichas y acentos propios por juego.

Definición de terminado:

- La home es reconocible como parte del mismo producto que los juegos.
- Los estados principales no dependen sólo del color.
- No aparecen saltos importantes durante la carga diferida.

### Fase 4 — Rendimiento percibido y descubrimiento

Objetivo: cargar primero lo necesario para la intención actual.

- [x] Sustituir `PreloadAllModules` por una estrategia selectiva.
- [x] Precargar únicamente la siguiente partida recomendada o rutas de alta probabilidad.
- [x] Revisar fondos e imágenes decorativas de tarjetas.
- [x] Medir tamaño inicial y solicitudes posteriores al arranque: `725.02 kB` iniciales; una única ruta recomendada elegible para precarga.
- [x] Añadir título de documento y descripción por ruta.
- [x] Evaluar búsqueda o filtros sólo si las categorías no son suficientes: las tres categorías actuales bastan para once juegos.

Definición de terminado:

- Abrir la home no descarga automáticamente todo el catálogo.
- Entrar al juego recomendado se siente inmediato.
- Cada ruta presenta un título identificable en historial y pestañas.

### Fase 5 — Validación

La validación automatizada está completa. Las pruebas con personas y la inspección visual en tamaños exactos permanecen abiertas porque requieren participantes y un navegador conectado.

- [ ] Prueba rápida con usuarios nuevos: encontrar y empezar un diario.
- [ ] Prueba con usuarios recurrentes: continuar progreso y revisar racha.
- [ ] Prueba móvil en 360×640 y 390×844.
- [ ] Prueba de escritorio en 1280×720 y 1440×900.
- [x] Navegación completa sólo con teclado.
- [x] Modo claro, oscuro y movimiento reducido.
- [x] Estado nuevo, en progreso, ganado, perdido y todos los diarios completados.
- [x] Perfil anónimo, sesión restaurándose y cuenta Google conectada.

## 10. Backlog priorizado

| ID | Mejora | Prioridad | Esfuerzo estimado | Dependencias | Estado |
|---|---|---:|---:|---|---|
| UX-101 | Unificar fecha diaria con Argentina | P0 | M | Ninguna | Completado |
| UX-102 | Crear modelo común de estado visible | P0 | M | UX-101 | Completado |
| UX-103 | Corregir estados por puntaje e ilimitados | P0 | S | UX-102 | Completado |
| UX-201 | Implementar “Siguiente partida” | P0 | M | UX-102 | Completado |
| UX-202 | Separar catálogo por modos | P0 | M | UX-102 | Completado |
| UX-203 | Convertir tarjetas en enlaces accesibles | P0 | S | UX-202 | Completado |
| UX-204 | Compactar bitácora diaria | P1 | M | UX-201 | Completado |
| UX-205 | Reubicar Novedades y ayuda | P1 | S | UX-202 | Completado |
| UX-301 | Definir shell único de juego | P1 | L | Ninguna | Completado |
| UX-302 | Implementar drawer móvil accesible | P1 | M | UX-301 | Completado |
| UX-303 | Unificar navegación de regreso | P1 | M | UX-301 | Completado |
| UX-401 | Diseñar tokens y tarjetas de plataforma | P1 | L | UX-202 | Completado |
| UX-402 | Mejorar estados de carga y touch | P2 | M | UX-401 | Completado |
| UX-501 | Implementar precarga selectiva | P2 | M | UX-201 | Completado |
| UX-502 | Añadir metadatos por ruta | P2 | S | Ninguna | Completado |

Escala de esfuerzo: `S` menor, `M` medio, `L` grande.

## 11. Métricas sugeridas

Si se incorpora analítica respetuosa de la privacidad, comparar antes y después:

- Tiempo desde carga de home hasta iniciar una partida.
- Porcentaje de visitas a home que abren un juego.
- Uso de `Continuar partida`.
- Porcentaje de usuarios que completan al menos un diario.
- Uso de categorías y juegos fuera de la primera fila.
- Apertura de bitácora y conversión de conexión con Google.
- Retorno al día siguiente y a siete días.
- Errores de navegación por teclado o auditoría automatizada.

## 12. Decisiones de producto pendientes

- [x] Juego recomendado para un usuario nuevo: Wordle, primer diario del catálogo.
- [x] Los diarios comparten categoría; Wordle funciona como entrada inicial y el resto conserva orden estable.
- [x] `Completado` permite abrir el resultado mediante la misma tarjeta.
- [x] Cada juego muestra una duración estimada en su tarjeta.
- [x] La sincronización con Google vive dentro del detalle expandido de la bitácora.
- [x] El sidebar se conserva como navegación contextual en escritorio y drawer en móvil.
- [x] La home prioriza racha, diarios completados y tiempo hasta el reinicio.
- [x] La publicidad se ubica después del catálogo y al pie o laterales de los juegos.

## 13. Primer incremento recomendado

El primer incremento debería incluir únicamente:

1. Fecha Argentina consistente.
2. Modelo único de estado.
3. Hero de “Siguiente partida”.
4. Secciones “Desafíos de hoy”, “Sin límites” y “Con amigos”.
5. Tarjetas semánticas con CTA.
6. Bitácora compacta sin rediseñar todavía su detalle.

Este corte entrega el mayor cambio perceptible y prepara el terreno para navegación, identidad visual y rendimiento sin exigir rediseñar todos los juegos al mismo tiempo.
