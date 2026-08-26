# Plan para corregir el rechazo de AdSense por “contenido de bajo valor”

Última revisión: 25 de agosto de 2026

## Objetivo

Convertir Game-DLE en un sitio que, además de ofrecer juegos funcionales, presente suficiente contenido original, contexto editorial, transparencia y señales técnicas para que tanto una persona como el sistema de revisión de Google puedan entender claramente cuál es el valor del sitio.

Este documento no garantiza la aprobación: Google realiza una revisión propia y no publica una cantidad mínima de páginas, palabras o visitas. El objetivo es corregir los problemas observables del proyecto y alinearlo con sus políticas oficiales.

## Diagnóstico actual

Game-DLE ya contiene numerosos juegos y mecánicas originales. El problema más probable no es la cantidad de juegos, sino cómo puede interpretar el sitio un revisor o crawler:

- La mayoría de las rutas están centradas casi exclusivamente en la interacción del juego.
- Parte del contenido informativo solo aparece después de completar una partida.
- No existen páginas públicas dedicadas a privacidad, términos, acerca del proyecto o metodología.
- El footer presenta redes sociales, correo y una opción de colaboración, pero no ofrece enlaces editoriales o legales.
- Algunas pantallas contienen hasta tres posiciones publicitarias: dos laterales y una inferior.
- La aplicación se entrega como una SPA de Angular. El HTML inicial contiene principalmente `<app-root>` y depende de JavaScript para mostrar el contenido.
- No hay `sitemap.xml` ni `robots.txt` públicos.
- Los juegos basados en datos no siempre explican de dónde proviene la información ni cuándo fue revisada.
- No hay una política de privacidad visible que describa el uso de cookies y servicios publicitarios.

Google establece que el contenido del editor debe aportar valor y ser el foco principal de la pantalla. También prohíbe publicar anuncios en pantallas sin contenido, con contenido de bajo valor o utilizadas principalmente para navegación o interacción. Además, la publicidad no debe superar al contenido propio.

Referencias oficiales:

- [Anuncios de Google en pantallas sin contenido del editor](https://support.google.com/publisherpolicies/answer/11112688?hl=es)
- [Más anuncios o material promocional que contenido del editor](https://support.google.com/publisherpolicies/answer/11169917?hl=es)
- [Guía inicial de políticas de AdSense](https://support.google.com/adsense/answer/23921?hl=es)
- [Políticas del programa AdSense](https://support.google.com/adsense/answer/48182?hl=es)

---

## Prioridad 1 — Contenido institucional y confianza

Estas páginas deben ser rutas reales, accesibles sin iniciar sesión y enlazadas desde el footer de todas las pantallas.

### 1. Página “Acerca de Game-DLE”

Ruta sugerida: `/acerca-de`

Debe incluir:

- Qué es Game-DLE y qué tipo de juegos ofrece.
- Quién creó y mantiene el proyecto.
- Por qué se creó.
- Qué diferencia sus juegos de otros clones o recopiladores.
- Cómo se desarrollan, revisan y actualizan los desafíos.
- Qué tecnologías o procesos se utilizan, explicado para el público general.
- Forma de contacto verificable.
- Enlace al perfil profesional o repositorio del autor.
- Fecha de última actualización de la página.

#### Por qué hay que agregarla

Permite demostrar que existe una persona responsable, un proyecto mantenido y una propuesta editorial propia. Actualmente esa información solo puede inferirse desde enlaces externos y no está explicada dentro del sitio.

### 2. Política de privacidad

Ruta sugerida: `/privacidad`

Debe describir, como mínimo:

- Quién es el responsable del sitio y cómo contactarlo.
- Qué información guarda la aplicación en `localStorage`.
- Si se utiliza Firebase Authentication, Realtime Database, Analytics u otros servicios.
- Qué datos pueden procesar esos servicios.
- Uso de Google AdSense.
- Uso de cookies, web beacons, direcciones IP u otros identificadores.
- Que Google y otros proveedores pueden utilizar cookies para mostrar y medir publicidad.
- Cómo desactivar la personalización de anuncios mediante la configuración de anuncios de Google.
- Cuánto tiempo se conservan los datos controlados por Game-DLE.
- Derechos y opciones de los usuarios.
- Fecha de entrada en vigencia y última modificación.

No se debe copiar una política genérica sin adaptarla a los servicios realmente utilizados por el proyecto.

#### Por qué hay que agregarla

Google exige a los editores mostrar claramente una política de privacidad que informe sobre el uso de cookies y la recopilación derivada de productos publicitarios.

Referencias oficiales:

- [Contenido obligatorio de la política de privacidad](https://support.google.com/adsense/answer/1348695?hl=es)
- [Cómo utiliza AdSense las cookies](https://support.google.com/adsense/answer/7549925?hl=es)
- [Divulgaciones de privacidad para editores](https://support.google.com/publisherpolicies/answer/10437794?hl=es)

### 3. Términos de uso

Ruta sugerida: `/terminos`

Debe incluir:

- Condiciones básicas de uso del sitio.
- Naturaleza recreativa y educativa de los juegos.
- Limitación razonable de responsabilidad por errores en datos o interrupciones.
- Propiedad del código, textos, diseño y contenidos originales.
- Tratamiento de marcas, nombres, imágenes o datos pertenecientes a terceros.
- Prohibición de abuso, automatización dañina o manipulación de partidas multijugador.
- Cómo comunicar errores o reclamos.
- Fecha de última actualización.

#### Por qué hay que agregarla

Mejora la transparencia y deja claro quién administra el servicio y bajo qué condiciones. No sustituye la política de privacidad.

### 4. Página de contacto

Ruta sugerida: `/contacto`

Debe incluir:

- Nombre del responsable.
- Correo funcional.
- Motivos de contacto: errores, sugerencias, privacidad y derechos de autor.
- Tiempo orientativo de respuesta si realmente puede cumplirse.
- Enlaces profesionales relevantes.

#### Por qué hay que agregarla

Un simple enlace `mailto:` es útil, pero una página dedicada aporta contexto, transparencia y una vía clara para reportar datos incorrectos o problemas de propiedad intelectual.

### Criterio de terminado para la prioridad 1

- [ ] Las cuatro rutas existen y cargan directamente mediante su URL.
- [ ] Todas están enlazadas desde el footer.
- [ ] El texto es específico de Game-DLE y coincide con los servicios realmente usados.
- [ ] No existen placeholders como “Tu Nombre” o “correo de ejemplo”.
- [ ] Las páginas son legibles en dispositivos móviles.
- [ ] Cada página tiene título y descripción SEO propios.

---

## Prioridad 2 — Aumentar el valor editorial de cada juego

Cada ruta monetizada debe contener información útil incluso antes de que el usuario interactúe. No alcanza con esconder todo el contenido detrás del final de una partida.

### Bloque mínimo recomendado por juego

Agregar debajo del tablero —o antes de la publicidad inferior— una sección editorial con:

1. **Qué es este juego**: descripción concreta de su objetivo y particularidad.
2. **Cómo jugar**: reglas completas, no solo una frase introductoria.
3. **Cómo se prepara el desafío**: selección de datos, aleatoriedad, actualización diaria o rondas ilimitadas.
4. **Qué significan las pistas**: explicación de colores, flechas, puntajes o estados.
5. **Fuentes y revisión**: procedencia de datos y fecha de última revisión.
6. **Preguntas frecuentes**: dudas reales y específicas de esa mecánica.
7. **Contenido relacionado**: enlaces a otros juegos relevantes del mismo sitio.

No existe un número de palabras oficialmente exigido. La meta es responder las preguntas reales de una persona y demostrar conocimiento y curación editorial; no rellenar páginas con texto repetitivo.

### Contenido específico sugerido

#### Wordle

- Explicar cómo se elige la palabra diaria.
- Aclarar qué diccionario o catálogo se utiliza.
- Definir el tratamiento de tildes, plurales y letras repetidas.
- Publicar consejos originales con ejemplos propios.

#### One Piece DLE y LoL DLE

- Indicar el alcance del catálogo y la fecha de actualización.
- Explicar cada atributo comparado.
- Identificar la fuente oficial o comunitaria utilizada para verificar datos.
- Aclarar que el proyecto no está afiliado a los titulares de las marcas.
- Revisar que el uso de imágenes y recursos sea compatible con sus derechos.

#### MusicDLE

- Explicar cómo se seleccionan y verifican las canciones.
- Indicar la procedencia del audio o reproductor utilizado.
- Documentar filtros, categorías y duración de fragmentos.
- Añadir notas editoriales sobre la selección musical.

#### GeoDLE

- Explicar las métricas de distancia, dirección y proximidad.
- Identificar las fuentes geográficas.
- Mostrar después de cada ronda una ficha educativa del país.
- Añadir enlaces a fuentes confiables.

#### ChronoDLE

- Mantener visible una explicación del criterio cronológico.
- Mostrar una selección de contenido histórico incluso antes de finalizar.
- Conservar las fuentes individuales de cada acontecimiento.
- Explicar cómo se revisan fechas históricas discutidas.

#### RankDLE

- Explicar qué criterio utiliza cada categoría.
- Publicar la fuente y fecha de actualización de rankings o estadísticas.
- Evitar presentar datos dinámicos sin aclarar el período correspondiente.

#### FutbolDLE y RoscoDLE

- Explicar qué competiciones, países y épocas abarca cada catálogo.
- Publicar criterios de nombres, apellidos, clubes y transferencias.
- Citar fuentes deportivas confiables.
- Indicar la fecha de revisión de planteles y datos.

#### Serpentile

- Explicar las reglas de generación y validez de cada tablero.
- Añadir ejemplos visuales de movimientos válidos e inválidos.
- Describir cómo se calcula el puntaje.

#### Tutti Frutti

- Explicar reglas, votación y puntuación.
- Incluir recomendaciones de convivencia y moderación.
- Informar qué datos se comparten o almacenan en las salas.
- Evitar anuncios en estados de espera, lobby vacío o pantallas puramente funcionales.

#### Palmó Primero

- Añadir una breve ficha biográfica después de cada respuesta.
- Incorporar una fuente individual para cada fecha de fallecimiento.
- Explicar cómo se resuelven fechas disputadas o calendarios diferentes.
- Añadir un archivo consultable de figuras, sin revelar necesariamente las parejas futuras.
- Aclarar el tono humorístico sin trivializar tragedias recientes.

### Por qué hay que agregar este contenido

Los juegos ofrecen valor interactivo, pero el crawler y el revisor también necesitan encontrar contenido propio, visible y revisado. Las explicaciones, metodología y fuentes convierten cada ruta en un recurso independiente y no en una pantalla compuesta únicamente por controles y anuncios.

### Criterio de terminado para la prioridad 2

- [ ] Cada juego tiene una introducción original y específica.
- [ ] Las instrucciones pueden entenderse sin comenzar una partida.
- [ ] Las fuentes están visibles y son accesibles.
- [ ] Los datos muestran una fecha de revisión cuando corresponde.
- [ ] Las preguntas frecuentes no son idénticas entre juegos.
- [ ] El contenido informativo aparece antes de cualquier anuncio inferior.
- [ ] No se generó contenido masivo sin revisión manual.

---

## Prioridad 3 — Reducir y reubicar publicidad

### Cambios recomendados antes de solicitar una nueva revisión

- Retirar temporalmente los anuncios laterales dobles.
- Mantener como máximo una ubicación publicitaria por ruta de juego durante la nueva revisión.
- Colocar esa unidad después del juego y de una sección editorial sustancial.
- No mostrar anuncios en:
  - lobbies vacíos;
  - pantallas de carga;
  - mensajes de error;
  - estados de espera multijugador;
  - resultados sin contenido adicional;
  - páginas legales;
  - pantallas cuya función principal sea navegar.
- Evitar que un anuncio quede pegado a botones como “Jugar”, “Siguiente”, “Compartir” o “Apoyar”.
- Verificar que ningún diseño pueda provocar clics accidentales en móvil.
- No pedir ni insinuar que el usuario debe hacer clic en anuncios para apoyar el proyecto.

### Por qué hay que hacerlo

Actualmente algunos juegos reservan dos unidades laterales y otra inferior. Aunque esas unidades solo aparezcan en pantallas grandes, pueden hacer que la relación entre contenido y publicidad parezca desproporcionada. Google indica que el material promocional no debe superar al contenido del editor.

La opción “Apoyar GameDLE” puede mantenerse porque se refiere a una transferencia directa, pero debe permanecer visual y conceptualmente separada de AdSense.

### Después de conseguir la aprobación

Reincorporar posiciones publicitarias de forma gradual, comprobando:

- visibilidad real del contenido;
- experiencia móvil;
- métricas de Core Web Vitals;
- ausencia de clics accidentales;
- cumplimiento de Better Ads Standards;
- que el contenido siga siendo claramente predominante.

### Criterio de terminado para la prioridad 3

- [ ] No hay más publicidad que contenido en ninguna ruta.
- [ ] Los anuncios no aparecen en pantallas sin contenido editorial.
- [ ] No hay unidades cercanas a controles principales.
- [ ] La versión móvil fue revisada manualmente.
- [ ] Los anuncios laterales permanecen deshabilitados durante la revisión.

---

## Prioridad 4 — SEO técnico y rastreabilidad

### 1. Prerenderizar las rutas públicas

Generar HTML estático para:

- `/home`
- todas las rutas de juegos;
- `/acerca-de`;
- `/privacidad`;
- `/terminos`;
- `/contacto`.

#### Por qué hay que hacerlo

Actualmente Firebase devuelve el mismo `index.html` con un `<app-root>` vacío y Angular construye el contenido en el navegador. Google puede ejecutar JavaScript, pero el prerenderizado permite que revisores, crawlers y herramientas reciban contenido significativo desde la respuesta inicial.

Esto es una mejora técnica recomendada; la política no obliga específicamente a usar SSR o prerenderizado.

### 2. Crear `robots.txt`

Debe permitir el rastreo de las rutas públicas e indicar la ubicación del sitemap.

Ejemplo orientativo:

```text
User-agent: *
Allow: /

Sitemap: https://game-dle.web.app/sitemap.xml
```

Actualizar el dominio si se utiliza uno personalizado.

### 3. Crear `sitemap.xml`

Debe incluir únicamente rutas públicas, canónicas y con contenido real. Actualizarlo al agregar o eliminar juegos.

### 4. Metadatos por ruta

Cada ruta debe tener:

- `<title>` único;
- descripción única;
- URL canonical;
- `lang="es"`;
- Open Graph básico para compartir;
- encabezado `<h1>` descriptivo y único.

### 5. Enlaces internos rastreables

- Todos los juegos deben ser accesibles desde enlaces HTML normales.
- Las páginas institucionales deben estar en el footer.
- Las secciones editoriales deben enlazar contenido relacionado útil.
- No debe haber rutas huérfanas accesibles únicamente escribiendo la URL.

### 6. Search Console

- Verificar ambas propiedades si conviven `web.app` y un dominio propio.
- Elegir un solo dominio canónico.
- Enviar el sitemap.
- Inspeccionar `/home`, varias rutas de juegos y todas las páginas institucionales.
- Confirmar que Google ve el texto renderizado.
- Corregir páginas excluidas, errores 404 blandos y duplicados.

### Criterio de terminado para la prioridad 4

- [ ] El HTML descargado de cada ruta contiene título, descripción y texto útil.
- [ ] `robots.txt` responde con HTTP 200.
- [ ] `sitemap.xml` responde con HTTP 200 y contiene las rutas correctas.
- [ ] Existe una sola versión canónica de cada URL.
- [ ] Search Console puede inspeccionar e indexar las páginas importantes.

---

## Prioridad 5 — Consentimiento y privacidad publicitaria

### Acciones

- Configurar en AdSense la sección **Privacidad y mensajes**.
- Activar un mensaje adecuado para el Espacio Económico Europeo, Reino Unido y Suiza si el sitio puede recibir tráfico de esas regiones.
- Utilizar la CMP de Google o una CMP certificada compatible con el TCF cuando corresponda.
- Evitar cargar publicidad personalizada antes de obtener el consentimiento exigido.
- Incluir un enlace permanente a la política de privacidad.
- Ofrecer una forma de volver a abrir o modificar las preferencias de privacidad cuando la configuración utilizada lo requiera.
- Documentar en la política qué almacenamiento pertenece a Game-DLE y cuál a proveedores externos.

### Por qué hay que hacerlo

Google exige una CMP certificada para determinados anuncios dirigidos a usuarios del EEE, Reino Unido y Suiza. Aunque el proyecto se encuentre en Argentina, el requisito depende de la ubicación del visitante, no solamente de la del editor.

Referencias oficiales:

- [Configurar y administrar una CMP](https://support.google.com/adsense/answer/7670013?hl=es)
- [Requisitos de gestión de consentimiento](https://support.google.com/adsense/answer/13554116?hl=es)

### Criterio de terminado para la prioridad 5

- [ ] La política de privacidad coincide con la configuración real.
- [ ] El mensaje de consentimiento está configurado en AdSense.
- [ ] Se probó el flujo de aceptar, rechazar y administrar opciones.
- [ ] No se implementó un banner decorativo que no controle realmente las etiquetas.

---

## Prioridad 6 — Calidad, propiedad intelectual y mantenimiento

### Revisión de datos

- Mantener un responsable y fecha de revisión por catálogo.
- Corregir datos desactualizados antes de publicar.
- Conservar fuentes para fechas, países, personajes, música y estadísticas.
- Distinguir claramente hechos, aproximaciones y decisiones propias del juego.

### Revisión de recursos de terceros

- Auditar imágenes de League of Legends y One Piece.
- Auditar audios, miniaturas y reproductores de MusicDLE.
- Registrar origen, licencia o fundamento de uso de cada recurso.
- Reemplazar recursos cuya utilización no pueda justificarse.
- Añadir avisos de no afiliación cuando corresponda, sin sugerir aprobación oficial.

### Evitar contenido artificial

- No crear decenas de artículos genéricos solo para aumentar palabras.
- No duplicar la misma explicación cambiando el nombre del juego.
- No publicar páginas generadas automáticamente sin revisión manual.
- No copiar descripciones completas de otras webs.
- No crear páginas vacías marcadas como “próximamente” con anuncios activos.

### Mantenimiento visible

- Mostrar “última actualización” en páginas y catálogos relevantes.
- Publicar un historial breve de novedades o cambios significativos.
- Mantener enlaces y fuentes funcionando.
- Retirar juegos rotos del catálogo hasta repararlos.

### Por qué hay que hacerlo

La originalidad no depende solamente del código. Google evalúa si el sitio agrega valor propio y si el contenido fue revisado y curado. La documentación de fuentes y licencias también reduce riesgos de políticas relacionadas con propiedad intelectual.

---

## Componentes reutilizables recomendados

Para no repetir implementación, crear componentes compartidos:

### `GameEditorialContentComponent`

Responsabilidades:

- introducción;
- reglas completas;
- metodología;
- fuentes;
- preguntas frecuentes;
- última actualización;
- juegos relacionados.

El contenido debe suministrarse por configuración, pero cada juego debe tener textos realmente específicos.

### `LegalPageLayoutComponent`

Responsabilidades:

- título;
- fecha de vigencia;
- índice accesible;
- contenido legible;
- contacto;
- enlaces entre documentos legales.

### `SourceListComponent`

Responsabilidades:

- nombre de la fuente;
- URL externa segura;
- fecha de consulta;
- descripción de qué dato respalda.

### `LastReviewedComponent`

Responsabilidades:

- fecha de revisión;
- responsable o equipo;
- enlace para reportar un error.

---

## Orden de implementación recomendado

### Etapa A — Bloqueantes

- [ ] Crear privacidad, acerca de, términos y contacto.
- [ ] Añadir los enlaces al footer.
- [ ] Reducir temporalmente las posiciones publicitarias.
- [ ] Configurar consentimiento y privacidad en AdSense.

### Etapa B — Valor editorial

- [ ] Crear el componente editorial reutilizable.
- [ ] Completar primero las rutas con anuncios activos.
- [ ] Añadir metodología y fuentes a todos los juegos basados en datos.
- [ ] Revisar derechos de imágenes, música y marcas.

### Etapa C — Rastreo

- [ ] Implementar prerenderizado.
- [ ] Crear sitemap y robots.
- [ ] Añadir canonical y metadatos únicos.
- [ ] Revisar enlaces internos y rutas huérfanas.

### Etapa D — Validación

- [ ] Ejecutar build y tests.
- [ ] Revisar escritorio y móvil.
- [ ] Validar enlaces y fuentes.
- [ ] Inspeccionar rutas en Search Console.
- [ ] Verificar que el contenido aparezca en el HTML renderizado.
- [ ] Confirmar que no existan anuncios en estados sin contenido.

### Etapa E — Nueva solicitud

- [ ] Desplegar todos los cambios.
- [ ] Confirmar que Google puede rastrearlos.
- [ ] Esperar a que las rutas principales sean rastreadas o indexadas; Google no establece en estas políticas un plazo fijo universal.
- [ ] Solicitar una nueva revisión desde AdSense.
- [ ] No realizar cambios estructurales grandes mientras la revisión esté en curso, salvo que sean necesarios para corregir errores graves.

---

## Qué no hacer

- No solicitar otra revisión después de cambiar solamente colores o diseño.
- No agregar más anuncios para comprobar si funcionan.
- No comprar tráfico ni usar intercambios de visitas.
- No pedir a familiares o usuarios que hagan clic en anuncios.
- No copiar artículos para aparentar más contenido.
- No esconder texto solo para crawlers.
- No colocar anuncios en páginas legales o secciones vacías.
- No asumir que una cantidad determinada de palabras garantiza aprobación.
- No presentar contenido generado automáticamente como si hubiera sido revisado.

---

## Lista final antes de solicitar revisión

### Contenido y confianza

- [ ] Acerca de Game-DLE publicado.
- [ ] Política de privacidad publicada y específica.
- [ ] Términos de uso publicados.
- [ ] Página de contacto publicada.
- [ ] Autor y responsable identificables.
- [ ] Metodología y fuentes visibles en cada juego relevante.
- [ ] Información útil visible antes de jugar.

### Publicidad

- [ ] Máximo una unidad por ruta durante la revisión.
- [ ] Sin anuncios laterales dobles.
- [ ] Sin anuncios en carga, error, espera, lobby vacío o navegación.
- [ ] Separación clara entre anuncios, controles y colaboración directa.
- [ ] Ningún texto incentiva clics en anuncios.

### Técnica

- [ ] Rutas prerenderizadas o HTML inicial con contenido significativo.
- [ ] Sitemap válido y enviado.
- [ ] Robots válido.
- [ ] Canonical correcto.
- [ ] Metadatos únicos.
- [ ] Sin errores visibles de consola o red.
- [ ] Sitio rápido y usable en móvil.

### Privacidad

- [ ] Política enlazada desde todas las páginas.
- [ ] Cookies y proveedores externos declarados.
- [ ] CMP configurada cuando corresponda.
- [ ] Preferencias de consentimiento probadas.

### Rastreo

- [ ] Home inspeccionada en Search Console.
- [ ] Varias rutas de juegos inspeccionadas.
- [ ] Páginas institucionales inspeccionadas.
- [ ] Google ve el texto y no solamente el contenedor Angular.

## Resultado esperado

Al completar este plan, Game-DLE debería presentarse como una publicación de juegos originales, mantenida y documentada, en vez de una colección de pantallas interactivas rodeadas de espacios publicitarios. Ese cambio de percepción es el objetivo central para responder al rechazo por “contenido de bajo valor”.
