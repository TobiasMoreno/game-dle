# Mobile Migration Analysis

Fecha de auditoría: 24 de septiembre de 2026.

Este informe se basa en el contenido y la configuración observados en este repositorio. No se implementaron cambios en la aplicación. Las versiones y requisitos de las tiendas indicados son los vigentes a la fecha de la auditoría y deben volver a verificarse inmediatamente antes de publicar.

## 1. Current Architecture

### Resumen técnico

| Área | Estado observado |
|---|---|
| Framework | Angular standalone 19.2.14; Angular CLI/build tooling 19.2.15 |
| Lenguaje | TypeScript 5.6.3, HTML y CSS |
| Reactividad | Angular Signals, `computed` y RxJS 7.8.2 (`BehaviorSubject`, observables) |
| Routing | Angular Router con `loadComponent` y rutas lazy; 50 páginas públicas generadas desde `src/app/public-pages.json`; wildcard route |
| Estado | Servicios Angular y estado local de componentes. No hay Redux, NgRx ni store global externo |
| Formularios | Formularios template-driven de Angular |
| Build | Angular application builder; entrada browser `src/main.ts`, entrada SSR/prerender `src/main.server.ts`, `outputMode: static`, salida `dist/game-dle/browser` |
| Hosting | Firebase Hosting, proyecto `game-dle`, desplegado desde `dist/game-dle/browser` |
| CI/CD | GitHub Actions con Node 20, `npm ci`, build, validaciones, tests y deploy a Firebase Hosting |
| Backend | No hay backend propio. Se usan Firebase Authentication y Firebase Realtime Database desde el cliente |
| Persistencia local | `localStorage` en varios servicios/componentes. No hay IndexedDB, SQLite ni una capa unificada de persistencia |
| Publicidad web | Componentes/configuración de Google AdSense existentes, actualmente deshabilitados mediante configuración |
| PWA | No está configurada: no hay service worker de Angular, web app manifest ni estrategia de caché offline |
| Capacitor | No está instalado ni configurado; no existen carpetas `android/` o `ios/` |

### Estructura y routing

La aplicación usa Angular standalone y carga las pantallas con rutas lazy. El `base href` actual es `/` y el routing usa History API. Firebase Hosting publica páginas prerenderizadas y conserva URLs limpias; `firebase.json` no contiene un rewrite global a `index.html`, lo cual es consistente con la salida estática/prerender actual.

El build generado auditado contiene 618 archivos y ocupa aproximadamente 36,9 MiB. La carpeta `public/` contiene 512 archivos y aproximadamente 30,2 MiB. El tamaño es razonable para una app casual empaquetada, aunque conviene optimizar audio e imágenes antes del primer release.

### Firebase actual

`src/app/shared/config/firebase.config.ts` contiene directamente la configuración pública del cliente web de Firebase: API key, dominios, project ID, app ID, measurement ID y URL de Realtime Database. Estos identificadores no son secretos equivalentes a una clave privada, pero deben restringirse por aplicación/origen cuando corresponda y nunca deben considerarse una barrera de seguridad.

Usos concretos:

- `DailyActivityService` inicia sesión anónima, configura persistencia local de Firebase Auth, guarda actividad diaria bajo `users/{uid}/activity` y ofrece login opcional con Google mediante popup.
- `TuttiFruttiRoomService` usa autenticación anónima, Realtime Database, listeners en tiempo real y `onDisconnect` para salas multiplayer.
- `database.rules.json` protege la actividad por UID. Las salas requieren autenticación, pero cualquier usuario autenticado que conozca o adivine una ruta/código puede leerla; parte de la puntuación y validación depende del cliente.

No se encontró Firebase Analytics ni Crashlytics integrado en el runtime actual.

### APIs y recursos externos

Dependencias runtime relevantes:

- Firebase Authentication y Realtime Database.
- YouTube IFrame API y embeds para MusicDLE.
- Imágenes de skins de League of Legends servidas desde Riot Data Dragon.
- Enlaces externos/sociales y `mailto:` abiertos desde la UI.

Los scripts de mantenimiento del catálogo también consultan servicios externos, pero no forman parte del runtime publicado: countries.dev, jsDelivr/flag-icons, Riot Data Dragon y endpoints de datos musicales de YouTube.

### Variables de entorno y secretos

No existe una estrategia de `.env` o `environment.ts` por plataforma. La configuración de Firebase y la de AdSense viven en archivos TypeScript. El workflow referencia el secreto de GitHub `FIREBASE_SERVICE_ACCOUNT_GAME_DLE`, sin incluir el valor en el repositorio. No se encontraron claves privadas, service-account JSON, keystores ni client secrets versionados.

### Persistencia observada

Se usa `localStorage` para preferencias, progreso y estado. Entre las claves y áreas encontradas están:

- `game-dle-games`, `game-dle-progress`, `game-dle-stats`.
- `game_progress_${gameId}`.
- `game-dle-daily-activity-v1`.
- `colorMode`.
- Estados versionados de Connections, ChronoDLE, Fútbol Mayor, MusicDLE, RankDLE, PalmoDLE y Serpentile.
- Selección de FutbolDLE y datos locales de salas/nombre de Tutti Frutti.

No se usa IndexedDB en el código de la aplicación. Realtime Database es la única persistencia remota observada, limitada a actividad del usuario y multiplayer. No hay login obligatorio.

### Features dependientes del navegador

- Uso directo de `window`, `document`, `navigator`, `localStorage`, `matchMedia`, clipboard y Web Share.
- Varias pantallas comparten resultados con `navigator.share` o clipboard; algunas construyen el enlace con `window.location.href` u `origin`.
- MusicDLE inyecta dinámicamente `https://www.youtube.com/iframe_api`, crea un reproductor embebido y entrega `window.location.origin` a YouTube.
- Audio mediante `new Audio(...)` y archivos MP3 locales.
- Canvas para procesamiento/pixelado de banderas.
- Drag-and-drop/pointer events y `touch-action` en juegos de ordenamiento.
- Timers con `setInterval`, `requestAnimationFrame` y estado mantenido en memoria.
- Manipulación de metadatos/canonical y del DOM desde servicios.
- Uso frecuente de alturas `100vh` y overlays/fixed positioning.

### Catálogo y assets

El repositorio incluye aproximadamente:

- 173 campeones de League of Legends y 168 imágenes locales relacionadas; varias skins se cargan en remoto.
- 127 personajes/imágenes de One Piece.
- 195 banderas SVG con licencia MIT de `flag-icons`.
- 614 pistas musicales basadas en identificadores de YouTube.
- 1.645 palabras y 32 arcos/categorías adicionales.
- Dos MP3 locales de aproximadamente 3,9 MiB y 2,1 MiB.

Los logos actuales no forman un set nativo listo para tiendas: uno es 458×542 y otro 1000×1000. Se necesitará una fuente cuadrada de al menos 1024×1024 y un recurso de splash suficientemente grande.

## 2. Potential Mobile Issues

### Problemas que deben resolverse antes del release

1. **Login de Google dentro del WebView.** `signInWithPopup` no es una estrategia válida/confiable dentro de WKWebView o Android WebView. Google bloquea OAuth en user-agents embebidos. Para el MVP conviene ocultar ese login en native y conservar autenticación anónima; si se incorpora más adelante, debe usarse autenticación nativa. En iOS, ofrecer Google como login principal normalmente también obliga a ofrecer Sign in with Apple. Véase la [política OAuth de Google para user-agents embebidos](https://developers.google.com/identity/protocols/oauth2/policies) y la [guía del error `disallowed_useragent`](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow).

2. **URLs compartidas.** En Capacitor, `window.location.origin` será un origen local de la WebView (`capacitor://localhost` en iOS o el origen configurado en Android), no la URL pública. Todos los shares deben generar enlaces `https://game-dle.web.app/...` mediante un servicio de URLs compartido.

3. **Persistencia durable.** `localStorage` funciona en una WebView, pero no debe tratarse como almacenamiento durable: el sistema puede purgarlo. Capacitor recomienda Preferences para pequeños datos persistentes. Estadísticas, streaks y configuración necesitan una migración versionada. Referencia: [Storage en Capacitor](https://capacitorjs.com/docs/guides/storage).

4. **YouTube/MusicDLE.** Requiere Internet y depende de un iframe remoto, cookies/políticas de YouTube, autoplay, reproducción inline y compatibilidad con el origen custom de iOS. Es el juego con mayor riesgo técnico dentro de la app y necesita prueba en dispositivos reales. Debe fallar de forma explícita y permitir volver al resto de los juegos cuando no haya red.

5. **Lifecycle y timers.** iOS/Android suspenden JavaScript en background. RoscoDLE reduce segundos por intervalos y podría reanudarse con tiempo incorrecto. Audio, animaciones y el monitoreo de MusicDLE también deben pausarse/reconciliarse. Los timers críticos deben persistir timestamps y calcular el tiempo restante con reloj real al volver a foreground.

6. **Safe areas y viewport.** No hay `viewport-fit=cover` ni estilos con `env(safe-area-inset-*)`. La UI debe adaptarse al notch, Dynamic Island, barras de sistema, navegación gestual y teclado. `100vh` debe revisarse en favor de `100dvh` o variables controladas.

7. **Back de Android.** Actualmente no existe una jerarquía de manejo nativa. El botón debe cerrar primero teclado/modal/sidebar, luego navegar hacia atrás y sólo permitir salir desde una pantalla raíz.

8. **Responsive/touch.** La aplicación ya tiene numerosos breakpoints y pointer events, por lo que la base es favorable. Aun así, drag-and-drop, canvas, overlays, sidebar, inputs y todos los juegos deben probarse con touch, pantallas pequeñas y zoom/tamaño de fuente accesible.

9. **Offline parcial.** El shell, catálogos e imágenes locales pueden empaquetarse. MusicDLE, multiplayer, skins remotas, anuncios, analytics y push requieren red. Actualmente no existe una UI consistente de offline/online.

10. **Firebase web dentro de native.** Auth anónima y RTDB deberían funcionar desde la WebView con red, pero necesitan apps Firebase nativas separadas y pruebas de App Check/CORS/conectividad. La API web de RTDB no mantiene datos offline entre sesiones de página según la [documentación de Firebase Realtime Database para web](https://firebase.google.com/docs/database/web/read-and-write).

11. **AdSense.** Un anuncio web AdSense no sustituye a un SDK mobile ni debe reutilizarse como publicidad nativa. Web debe conservar su configuración de AdSense y Android/iOS usar AdMob detrás de una abstracción por plataforma.

12. **Carga inicial.** Aproximadamente 37 MiB de salida no impiden publicar, pero imágenes y MP3 incrementan instalación, memoria y tiempo de inicio. Conviene comprimir, convertir imágenes cuando sea posible y verificar que Angular sólo cargue lo necesario por ruta.

## 3. Recommended Mobile Architecture

### Recomendación concreta

Capacitor 8 es la mejor alternativa para este repositorio. Permite conservar la UI Angular, el routing, los juegos, los catálogos y casi toda la lógica, añadiendo una capa pequeña y explícita para capacidades nativas.

```text
                         Angular shared code
                        /                   \
        Web build (SSR/prerender)      Mobile client build
                 |                             |
         Firebase Hosting                 Capacitor 8
                                            /      \
                                      Android      iOS
                                         |           |
                                      AdMob       AdMob
                                         \           /
                                 Firebase Analytics/Crashlytics
```

La aplicación web debe seguir desplegándose con el pipeline actual. El build mobile debe ser una variante client-only, sin SSR/prerender, copiada a Capacitor. Las diferencias se encapsulan en servicios pequeños: publicidad, analytics, share, haptics, persistencia, lifecycle y plataforma.

### Comparación para este repositorio

| Alternativa | Reutilización | Mantenimiento | Ads/native | Android+iOS | Evaluación |
|---|---:|---:|---:|---:|---|
| Capacitor | Muy alta | Bajo/medio | Buena vía plugins nativos | Sí | **Recomendada** |
| PWA | Muy alta | Bajo | AdMob nativo no uniforme; capacidades iOS limitadas | Instalación web, no reemplaza el binario nativo | Complementaria, no solución principal |
| React Native | Media/baja | Alto: habría que rehacer UI/DOM y juegos | Excelente | Sí | Reescritura injustificada |
| Flutter | Baja | Alto: reescritura total y segundo stack | Excelente | Sí | Reescritura injustificada |
| WebView custom | Alta | Alto riesgo: lifecycle, plugins, bridges y seguridad propios | Posible, manual | Sí | Reinventa Capacitor |
| Trusted Web Activity | Alta | Bajo | Android solamente y dependiente de web | No iOS | No satisface el objetivo |
| Ionic UI + Capacitor | Alta | Medio | Buena | Sí | No es necesario reemplazar la UI Angular actual |
| Tauri Mobile | Alta | Medio/alto | Ecosistema de ads mobile menos directo | Sí | Sin ventaja clara aquí |

El rendimiento esperado es suficiente para un juego casual basado en DOM/canvas/audio. No se observaron gráficos 3D, procesamiento nativo intensivo ni otra razón que justifique React Native o Flutter.

## 4. Capacitor Feasibility

### Viabilidad

**Alta**, con riesgos focalizados en autenticación Google, MusicDLE/YouTube, persistencia durable, lifecycle de timers y requisitos de publicación/contenido. Capacitor 8 soporta Android API 24+ e iOS 15+, utiliza WKWebView en iOS y requiere Node 22+, Android Studio 2025.2.1+ y Xcode 26+. Referencias: [entorno de Capacitor 8](https://capacitorjs.com/docs/getting-started/environment-setup), [Android](https://capacitorjs.com/docs/android) e [iOS](https://capacitorjs.com/docs/ios).

La máquina auditada tiene Node 22.12.0, compatible con Capacitor 8. El workflow web usa Node 20; debe mantenerse para el pipeline web actual o actualizarse deliberadamente. Cualquier workflow mobile con Capacitor 8 debe usar Node 22.

### Configuración necesaria

- Crear `capacitor.config.ts` con `appId` definitivo, `appName: 'GameDLE'` y `webDir: 'dist/game-dle/browser'`.
- Agregar una configuración Angular `mobile` client-only que produzca `index.html` sin server/prerender. Esto evita copiar 50 árboles prerenderizados y reduce supuestos de SSR dentro de la WebView.
- Agregar scripts para `build:mobile`, `cap sync`, apertura/ejecución Android e iOS.
- Generar y versionar `android/` e `ios/`, excepto secretos y artefactos locales.
- Mantener intacto el build/prerender web y `firebase.json`.
- Detectar plataforma en servicios, no dispersar condicionales por todos los componentes.

### Routing y navegación

Angular Router puede mantenerse. El build mobile debe arrancar siempre desde el documento local y Angular debe resolver las rutas. Deben probarse deep links internos, refresh/reanudación y el historial del WebView. No se necesita HashLocationStrategy inicialmente; sólo sería un fallback si aparecen rutas incompatibles durante las pruebas empaquetadas.

Los links externos deben abrirse en el navegador del sistema. Los enlaces compartidos deben apuntar siempre al dominio web público y, si se desean deep links nativos post-MVP, configurarse con Android App Links y Universal Links.

### Assets, iconos y splash

- Crear assets fuente propios y revisados: icono cuadrado de al menos 1024×1024 y splash de al menos 2732×2732.
- Generar variantes Android/iOS con `@capacitor/assets` siguiendo la [guía de iconos y splash de Capacitor](https://capacitorjs.com/docs/guides/splash-screens-and-icons).
- Evitar texto esencial en el splash por recortes/aspect ratios.
- Comprimir los recursos del juego sin degradar pistas visuales.
- Preparar icono adaptable Android (foreground/background/monochrome) y todos los tamaños de AppIcon de iOS.

### UI del sistema, safe areas y orientación

- Agregar `viewport-fit=cover` y variables CSS para safe areas.
- Aplicar insets al shell, header, controles inferiores, modales y banners; verificar notch y Dynamic Island.
- Mantener status bar visible y coordinada con tema claro/oscuro. No usar fullscreen inmersivo para el MVP.
- Recomendación MVP: bloquear o declarar orientación portrait porque la mayoría de las pantallas están diseñadas verticalmente. Si se admite landscape, debe ser una decisión probada, no accidental.
- Usar el plugin Keyboard para ajustar resize/scroll y evitar que inputs y CTAs queden ocultos.

### Back button Android

Implementar una política central:

1. cerrar teclado;
2. cerrar diálogo/sidebar/overlay;
3. retroceder en Angular Router si existe historial;
4. en la ruta raíz, permitir la salida nativa o exigir un segundo gesto según la UX elegida.

No debe salir de la app al cerrar un modal ni dejar estados de juego corruptos.

### Fullscreen, audio y WebView

La WebView es adecuada. Deben validarse reproducción inline, autoplay sólo después de interacción, audio focus, interrupciones por llamada/auriculares y pausa al ir a background. MusicDLE requiere una prueba específica de YouTube IFrame con el esquema/origen de Capacitor en iOS y Android.

### LocalStorage, cookies y red

- `localStorage` funcionará inicialmente, pero los datos valiosos deben migrarse a Capacitor Preferences.
- La app no usa cookies propias como mecanismo central. YouTube puede usar las suyas dentro del embed; el cookie jar de una WebView es distinto al navegador del sistema.
- `fetch`/Firebase desde la WebView seguirán sujetos a conectividad, TLS y políticas del servidor.
- CORS no se soluciona con Capacitor: cualquier endpoint debe aceptar el origen/esquema correspondiente o ser consumido mediante un plugin/native HTTP sólo si existe un motivo real. Firebase SDK ya gestiona sus endpoints; YouTube debe probarse.

### Lifecycle y background

Usar `@capacitor/app` para `appStateChange` y centralizar:

- guardado de progreso al pasar a background;
- pausa de audio, animaciones y reproducción remota;
- persistencia de timestamps;
- reconciliación de timers al reanudar;
- reconexión de listeners multiplayer;
- recarga/preparación segura de anuncios sin otorgar recompensas duplicadas.

## 5. Android Requirements

### Toolchain y proyecto

- Android Studio 2025.2.1 o posterior para Capacitor 8.
- JDK/Gradle administrados por la versión generada de Capacitor; no fijar versiones antiguas manualmente.
- `minSdk` coherente con Capacitor 8: API 24 o superior.
- A la fecha de este informe, Google Play exige que nuevas apps y actualizaciones apunten a Android 16/API 36 desde el 31 de agosto de 2026. Verificar otra vez antes de subir: [requisitos de target API de Google Play](https://developer.android.com/google/play/requirements/target-sdk).

### Identidad y versionado

- Elegir un `applicationId` único y permanente, por ejemplo `com.<organizacion>.gamedle`. El ejemplo no debe adoptarse sin confirmar propiedad de dominio/marca.
- Administrar `versionCode` entero creciente y `versionName` semántico.
- Registrar la app Android con exactamente ese package name en Firebase y AdMob.

### Firma y entrega

- Crear un upload keystore y conservarlo fuera del repositorio, respaldado y con credenciales en un gestor de secretos.
- Activar Play App Signing.
- Producir un Android App Bundle `.aab` firmado para Play; APK sólo para desarrollo/testing puntual.
- Nunca versionar `.jks`, `.keystore`, passwords, `local.properties` ni service accounts.

### Manifest, permisos y SDKs

Permisos mínimos probables:

- `INTERNET` y acceso al estado de red.
- Notificaciones (`POST_NOTIFICATIONS`) sólo cuando push sea implementado y con prompt contextual.
- Advertising ID únicamente si la combinación de SDK/configuración lo necesita y declarando su uso.

No se observan necesidades de cámara, micrófono, ubicación, contactos o almacenamiento compartido. No solicitarlos.

Agregar al proyecto nativo:

- Firebase `google-services.json` de la app Android.
- Google Services/Crashlytics Gradle plugins cuando se activen Analytics/Crashlytics.
- AdMob App ID en recursos/`AndroidManifest.xml`.
- Iconos adaptativos, splash y nombre localizado.

### Flujo de publicación

1. Crear app en Play Console y completar package, ficha, content rating, categoría y datos de contacto.
2. Subir un AAB firmado a internal testing.
3. Validar dispositivos, WebView, offline, compras inexistentes, anuncios de prueba y cierre/reanudación.
4. Pasar a closed testing. Las cuentas personales creadas después del 13 de noviembre de 2023 necesitan al menos 12 testers opted-in durante 14 días continuos antes de pedir acceso a producción: [requisitos de testing](https://support.google.com/googleplay/android-developer/answer/14151465).
5. Completar Privacy Policy, Data Safety, Ads declaration, content rating, target audience y acceso de revisión. Referencia: [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469).
6. Promover gradualmente a producción y observar ANRs/crashes/retención.

## 6. iOS Requirements

### Toolchain y cuenta

- Una Mac con Xcode 26 o un servicio CI macOS; el entorno Windows actual no puede compilar ni firmar iOS localmente.
- Apple Developer Program activo.
- Capacitor 8 soporta iOS 15+ y WKWebView.
- Desde el 28 de abril de 2026, los uploads deben construirse con el SDK de iOS 26/Xcode 26; verificar las [novedades de requisitos de Apple](https://developer.apple.com/news/) y los [requisitos de Xcode](https://developer.apple.com/xcode/system-requirements/) antes del envío.

### Identidad, firma y entrega

- Elegir un Bundle Identifier permanente y consistente con Capacitor/Firebase/AdMob.
- Configurar Team, signing certificate y provisioning profile; Automatic Signing es suficiente para comenzar.
- Crear la app en App Store Connect, cargar con Xcode/Transporter y distribuir mediante TestFlight antes de review. Referencia: [upload de builds en App Store Connect](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds).

### Configuración nativa

- `GoogleService-Info.plist` para la app iOS correspondiente.
- AdMob App ID, SKAdNetwork IDs y claves requeridas en `Info.plist`.
- `NSUserTrackingUsageDescription` sólo si realmente se solicita ATT/seguimiento; el texto debe explicar el uso con precisión.
- Privacy Manifest `PrivacyInfo.xcprivacy` propio y manifests de SDKs. Capacitor documenta los requisitos en [Privacy Manifest para iOS](https://capacitorjs.com/docs/ios/privacy-manifest).
- AppIcon completo, launch screen, status bar, orientaciones soportadas y URLs/esquemas necesarios.
- dSYM y script de Crashlytics en el build para simbolicar crashes.

### ATT y privacidad

ATT no es sinónimo de consentimiento de anuncios. UMP/consentimiento regional y ATT son capas distintas. Si se usan anuncios personalizados o datos enlazados entre apps/sitios, solicitar ATT en contexto y sólo después del consentimiento aplicable. El MVP puede reducir riesgo usando anuncios no personalizados/contextuales hasta validar el flujo. Véase [Apple User Privacy and Data Use](https://developer.apple.com/app-store/user-privacy-and-data-use/) y [App Tracking Transparency](https://developer.apple.com/documentation/apptrackingtransparency).

### Riesgo de rechazo por ser web-based

Apple acepta apps híbridas, pero Guideline 4.2 exige más que un sitio web reempaquetado. GameDLE puede demostrar valor de app mediante contenido local/offline, integración nativa de haptics/share, buen lifecycle, UI mobile, notificaciones opt-in y rendimiento estable. Debe evitar una pantalla que parezca simplemente abrir la web remota. Referencia: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

Otros puntos sensibles:

- El login de Google requiere implementación nativa y probablemente Sign in with Apple; el camino más simple para MVP es no mostrar login social en mobile.
- Si se crean cuentas visibles, Apple exige eliminación de cuenta dentro de la app.
- El aporte directo por transferencia mostrado en el diálogo de soporte puede interpretarse como un método de pago externo. Ocultarlo en native MVP o reemplazarlo más adelante por una opción compatible con las reglas de In-App Purchase.
- Tutti Frutti contiene texto generado por usuarios. Debe evaluarse moderación, filtrado, reporte y bloqueo antes de promocionarlo como experiencia pública.
- Revisar derechos de personajes, logos, audio, imágenes y marcas antes del envío.

## 7. AdMob Integration

### Plugin recomendado

Usar `@capacitor-community/admob` en su major compatible con Capacitor 8. El proyecto mantiene soporte para Android e iOS y expone banner, interstitial, rewarded, rewarded interstitial y app-open ads, además de helpers de UMP/consentimiento y ATT. La rama v8 está activa; comprobar la versión estable exacta al instalar. Fuentes: [repositorio de Capacitor Community AdMob](https://github.com/capacitor-community/admob) y [releases](https://github.com/capacitor-community/admob/releases).

No implementar anuncios reales todavía. La preparación correcta es una arquitectura desacoplada:

```text
Game components
      |
AdService interface
  |                 |
WebAdService     NativeAdMobService
(no-op/AdSense)  (Android/iOS)
                       |
          consent -> load -> show -> reward event
```

### Rewarded Ads: diseño prioritario

Definir placements explícitos:

- `hint`: ver anuncio para obtener una pista.
- `extra_attempt`: recuperar un intento.
- `continue`: continuar una partida terminada.

Reglas de integridad:

- La UI solicita la recompensa al servicio y nunca la otorga por el mero hecho de abrir el anuncio.
- Otorgar exactamente una vez sólo al recibir el evento nativo de recompensa.
- Persistir un identificador/estado de transacción local durante la transición para evitar doble premio al pausar/reanudar.
- Manejar `not_ready`, cierre sin recompensa, falta de red y error sin bloquear la partida.
- Precargar el siguiente anuncio después de completar/cerrar el anterior.
- Usar exclusivamente IDs de anuncios de prueba en debug y testing.
- No permitir reward ads a mitad de una animación o submit crítico.

Eventos mínimos: `rewarded_ad_requested`, `rewarded_ad_loaded`, `rewarded_ad_completed`, `rewarded_ad_failed` y `reward_granted`, con `game_id`, `placement`, `reward_type` y código de error no sensible.

### Interstitials

Mostrar sólo en pausas naturales, por ejemplo después de finalizar entre 3 y 5 partidas, con un límite adicional por tiempo. No mostrar:

- en la primera sesión o primera partida;
- durante una partida;
- inmediatamente después de un rewarded ad;
- al abrir/cerrar la app;
- cuando el usuario perdió por un error técnico.

La frecuencia debe ser Remote Config o configuración local simple post-MVP, basada en telemetría y nunca diseñada para provocar clics accidentales.

### Banners

Son opcionales. Si se usan, deben reservar espacio/inset para no cubrir botones ni tablero y ocultarse en pantallas densas. Por la naturaleza del juego, rewarded ads más interstitials moderados ofrecen una UX más limpia. Mantener AdSense sólo para web y AdMob sólo para native.

### Consentimiento

Inicializar consentimiento antes de solicitar anuncios personalizados. Integrar UMP, ofrecer opciones de privacidad y aplicar ATT en iOS sólo cuando corresponda. Data Safety y App Privacy deben reflejar exactamente la configuración real del SDK.

## 8. Firebase Analytics / Crashlytics

### Integración recomendada

- `@capacitor-firebase/analytics` para Analytics nativo en Android/iOS y un adaptador web para la versión hospedada.
- `@capacitor-firebase/crashlytics` para Android/iOS. Crashlytics no tiene SDK web equivalente; en browser se puede conservar logging propio o sumar otro servicio sólo si aparece una necesidad real.
- Un `AnalyticsService` y un `ErrorReportingService` propios para que los componentes no dependan directamente del plugin.

La suite mantenida por Capawesome documenta soporte Capacitor 8: [Firebase para Capacitor](https://capawesome.io/docs/sdks/capacitor/firebase/), [Analytics](https://capawesome.io/docs/sdks/capacitor/firebase/analytics/) y [Crashlytics](https://capawesome.io/docs/sdks/capacitor/firebase/crashlytics/).

Analytics/Firebase medirá automáticamente `first_open`, sesiones y audiencias para DAU/MAU; Play Console y App Store Connect son la fuente principal de instalaciones. La retención D1/D7/D30 se obtiene con cohorts/audiencias de Analytics, no enviando un evento manual cada día.

### Taxonomía propuesta

| Evento | Parámetros sugeridos |
|---|---|
| `game_started` | `game_id`, `game_mode`, `is_daily`, `round_id` no sensible |
| `game_finished` | `game_id`, `result`, `attempts`, `score`, `duration_ms` |
| `guess_submitted` | `game_id`, `attempt_index`, `outcome`; nunca el texto/nombre adivinado |
| `hint_requested` | `game_id`, `hint_type`, `source` |
| `hint_used` | `game_id`, `hint_type` |
| `extra_attempt_requested` | `game_id`, `source` |
| `extra_attempt_granted` | `game_id`, `source` |
| `continue_requested` | `game_id`, `source` |
| `continue_used` | `game_id`, `source` |
| `rewarded_ad_requested` | `game_id`, `placement`, `reward_type` |
| `rewarded_ad_loaded` | `game_id`, `placement` |
| `rewarded_ad_completed` | `game_id`, `placement` |
| `rewarded_ad_failed` | `game_id`, `placement`, `error_code` |
| `reward_granted` | `game_id`, `placement`, `reward_type` |
| `interstitial_ad_shown` | `placement`, `games_since_last` |
| `banner_ad_impression` | `screen_name`, `placement` |
| `share_result` | `game_id`, `share_method` |
| `room_created` | `game_id`; sin código/nombre |
| `room_joined` | `game_id`; sin código/nombre |
| `room_finished` | `game_id`, `player_count`, `duration_ms` |
| `notification_permission_prompted` | `context` |
| `notification_permission_result` | `status` |
| `notification_opened` | `campaign`, `destination` |
| `offline_session` | `entry_screen` |
| `sync_failed` | `operation`, `error_code` |

Parámetros comunes: `platform`, `app_version`, `game_id`, `game_mode` y `ad_placement`. No enviar respuestas, códigos de sala, nombres de jugadores, títulos buscados ni otro texto libre. Firebase limita los nombres y parámetros; consultar las [restricciones de nombres de eventos](https://firebase.google.com/docs/reference/cpp/group/event-names).

### Punto de instrumentación

`GameManagerService.completeGame` ya centraliza finalización en varios juegos y es un buen punto inicial, pero MusicDLE, varios juegos de LoL, Enclosure, RoscoDLE y Tutti Frutti no parecen completar todos sus flujos por ese mismo camino. Se necesita auditar cada finalización y, preferiblemente, emitir un dominio común sin reescribir los juegos.

### Crashlytics

- Configurar Gradle/Google Services en Android y dSYM/run script en iOS.
- Capturar excepciones Angular mediante un `ErrorHandler` global y `unhandledrejection` como non-fatal, conservando stack trace cuando sea posible.
- Agregar claves no sensibles como `game_id`, pantalla, build y estado offline.
- Nunca adjuntar respuestas, nombres, room codes, UID completo ni contenido del usuario.
- Probar un crash controlado y un non-fatal antes de release; confirmar simbolicación y sourcemaps.

## 9. Mobile Features

### Clasificación

| Feature | Fase | Implementación |
|---|---|---|
| Haptics básicos | MVP | `@capacitor/haptics`; no-op web |
| Native Share | MVP | `@capacitor/share`, siempre con URL pública |
| Lifecycle/back/keyboard/status bar/safe areas | MVP | Plugins oficiales y shell central |
| Analytics + Crashlytics | MVP | Adaptadores por plataforma |
| Push notifications | POST-MVP | FCM + APNs, después de validar retención y contenido |
| Interstitials | POST-MVP | Tras medir sesiones y fijar frecuencia moderada |
| Login nativo/social y sync multi-dispositivo | POST-MVP | Sólo si aporta valor; incluir Sign in with Apple |
| PWA/service worker web | POST-MVP | Mejora complementaria de la versión web |
| Banners | OPCIONAL | Sólo si no degradan layout/UX |
| SQLite | OPCIONAL | No justificado por el volumen/estructura actual |
| App-open ads | OPCIONAL | No recomendado inicialmente por UX |
| Orientación dinámica por juego | OPCIONAL | Sólo si algún juego obtiene beneficio claro |

### Haptics

- Respuesta correcta: impacto corto/light.
- Respuesta incorrecta: notification warning o patrón diferenciado, sin abusar.
- Victoria: notification success o secuencia breve especial.

Debe respetarse la configuración del sistema y evitar feedback en cada toque. Web mantiene comportamiento sin vibración o usa una implementación no-op segura.

### Native Share

Centralizar texto y URL en un servicio. `@capacitor/share` abrirá el menú nativo; web conserva `navigator.share` y fallback a clipboard. Los componentes que hoy usan `window.location` deben dejar de construir la URL individualmente.

### Push Notifications

FCM será la capa de mensajería; en Android entrega vía Firebase y en iOS FCM se integra con APNs. Capacitor documenta el flujo en [Push Notifications con Firebase](https://capacitorjs.com/docs/guides/push-notifications-firebase). Se necesita:

- capability Push Notifications y APNs key/certificate en Apple;
- registrar APNs en Firebase;
- canal de notificación Android, icono y permiso runtime cuando corresponda;
- solicitar permiso sólo después de explicar el valor, no al primer arranque;
- almacenar tokens por instalación si se requieren campañas segmentadas;
- enviar desde Firebase Console o un entorno de confianza/Admin SDK, nunca desde secretos incluidos en la app;
- deep link interno para “Nuevo desafío” o “¿Podés mantener tu racha?”.

Para el MVP no hace falta construir backend de notificaciones. Firebase Console permite validar campañas simples. Si luego se automatiza el desafío diario, recién entonces se justifica una Cloud Function/servicio programado mínimo.

## 10. Persistence

### Estado actual

La mayor parte de estadísticas, configuración, progreso y estado de partidas se guarda en `localStorage`. La actividad diaria también se replica en Firebase bajo el UID anónimo. Tutti Frutti usa Realtime Database para la sala activa. No hay IndexedDB ni backend propio.

Esto permite un prototipo Capacitor, pero no garantiza que un streak o high score sobreviva indefinidamente a limpieza del sistema, reinstalación o cambio de dispositivo.

### Recomendación simple

Crear una interfaz única de persistencia:

```text
StorageService
  ├── WebStorageAdapter        -> localStorage en web
  └── NativePreferencesAdapter -> @capacitor/preferences en mobile
```

- Migrar al primer inicio cada clave conocida desde `localStorage` a Preferences y marcar una versión de migración.
- Mantener JSON versionado y validado; si un valor está corrupto, recuperar defaults sin romper el juego.
- Persistir estadísticas, high score, streak, configuración y progreso al cambiar, al pausar y al completar partida.
- Ofrecer “Restablecer datos” en ajustes y documentar que desinstalar elimina datos locales.
- No agregar SQLite en el MVP: no existe volumen ni consulta relacional que lo justifique.
- Mantener Auth anónima para actividad/multiplayer sin login obligatorio. El sync multi-dispositivo puede esperar.

Si se quiere garantizar recuperación entre dispositivos más adelante, se puede ofrecer login opcional y sincronizar sólo estadísticas/progreso. Eso implica resolución de conflictos, account linking, eliminación de cuenta y Sign in with Apple en iOS.

## 11. Offline Support

### Qué puede funcionar offline

La mayoría de los juegos basados en catálogos, palabras, banderas e imágenes locales puede cargar enteramente desde el bundle. La app shell y las rutas client-side también pueden iniciar sin conexión porque Capacitor sirve archivos empaquetados localmente.

### Dependencias que seguirán online

- MusicDLE por YouTube IFrame/API.
- Tutti Frutti multiplayer por Realtime Database.
- Skins de LoL servidas desde Riot Data Dragon.
- Anuncios, Analytics, Crashlytics upload y push.
- Sync de actividad y cualquier leaderboard futuro.

### Cambios necesarios

- Añadir un servicio de conectividad y estados visibles `offline`, `connecting` y `retry`.
- Bloquear o explicar sólo el juego/feature que necesita red; no bloquear toda la app.
- Incluir fallbacks locales o evitar seleccionar skins remotas cuando no haya red.
- Guardar progreso antes de salir y reintentar sync no crítico al recuperar conexión.
- No implementar un backend nuevo para esto.
- Para web, un service worker/PWA es una mejora separada. No hace falta service worker dentro del bundle Capacitor.

No se recomienda descargar JavaScript principal desde el servidor para actualizar la app sin pasar por las tiendas. El bundle funcional debe viajar con cada release nativo; contenido remoto puede actualizarse si tiene versionado, validación e integridad.

## 12. Security

### Hallazgos

- La configuración cliente de Firebase está hard-coded. Es visible por diseño y seguirá siendo inspeccionable en el binario. La seguridad real depende de Auth, reglas, App Check y validación server-side.
- No se encontraron claves privadas o credenciales de servicio en el repositorio. El service account de deploy se referencia como GitHub Secret.
- `.gitignore` no contempla todavía keystores, provisioning/local config ni artefactos sensibles nativos.
- Las reglas de usuario aíslan por UID. Las salas permiten lectura a usuarios autenticados y usan códigos cortos; además, datos y score se aceptan en buena medida desde clientes manipulables.
- No hay App Check, rate limiting, expiración/limpieza explícita de salas ni validación autoritativa para leaderboard.
- Tutti Frutti almacena nombres y respuestas introducidos por usuarios y carece de mecanismos visibles de moderación/reporte/bloqueo.
- Analytics futuro no debe registrar respuestas, búsquedas, códigos de sala ni nombres.

### Acciones recomendadas

- Registrar aplicaciones Firebase Android/iOS separadas; restringir API keys por package/SHA y bundle ID cuando el servicio lo permita.
- Activar y probar Firebase App Check de forma gradual, con métricas antes de enforcement.
- Endurecer reglas de salas, validar esquemas/tamaños/estados, limitar writes indebidos y definir TTL/limpieza.
- No confiar en resultados enviados por cliente para premios o leaderboards. Un leaderboard competitivo requeriría validación confiable; no agregarlo al MVP.
- Agregar secretos nativos al `.gitignore` y al gestor de secretos del CI.
- Mantener service-account, keystore passwords, APNs keys y certificados fuera del bundle/repositorio.
- Publicar Privacy Policy accesible tanto dentro de la app como por URL web.
- Mantener dependencias nativas en versiones compatibles y revisar advisories antes de cada release.

Todo recurso incluido en JavaScript, `public/`, Android assets o el bundle iOS puede ser extraído por el usuario. No incluir algoritmos/keys que necesiten secreto real.

## 13. Assets / Content Review

Inventario técnico a revisar antes de publicar, sin emitir opinión legal:

| Contenido | Ubicación/tipo | Motivo de revisión |
|---|---|---|
| League of Legends | `public/img_lol/`, catálogo JSON, skins remotas de Data Dragon | Personajes, nombres, imágenes, logos/marcas y política de uso de Riot |
| One Piece | `public/img_op/`, fondos y catálogos de personajes/arcos | Personajes, nombres e imágenes de una franquicia de terceros; prioridad alta |
| Música | Dos MP3 locales y catálogo de 614 videos/IDs YouTube | Derechos de grabación/composición, reproducción embebida y términos de YouTube; prioridad alta |
| Fútbol | Nombres de jugadores, equipos, ligas y datos históricos | Marcas, datos y posibles derechos de base de datos; revisar fuentes/atribución |
| Banderas | 195 SVG de `flag-icons` | Licencia MIT presente; conservar licencia/atribución requeridas |
| Países, rankings, historia y biografías | JSON/datasets y enlaces de fuentes | Verificar procedencia, licencia, exactitud y actualización |
| Logos GameDLE | Imágenes claras/oscuras actuales | Confirmar autoría/marca; crear master nativo adecuado |
| Screenshots/fondos | Imágenes de UI y fondos en `public/` | Confirmar que cada archivo tenga origen y permiso documentado |

`docs/recursos-terceros.md` ya funciona como inventario inicial, pero no prueba licencias por archivo. Antes de las tiendas conviene crear una tabla por asset/dataset con fuente, autor, licencia, fecha y permiso/evidencia. Las fichas de tienda y screenshots tampoco deben mostrar contenido no autorizado.

## 14. Store Publication Risks

### Riesgos principales

1. **Propiedad intelectual/contenido:** One Piece, League of Legends, música/YouTube, nombres e imágenes deportivas pueden provocar reclamos o rechazo. Es el mayor riesgo no técnico.
2. **Apple minimum functionality:** una WebView sin adaptación puede caer bajo Guideline 4.2. Offline local, share/haptics nativos, lifecycle correcto y UI mobile reducen el riesgo.
3. **Google OAuth embebido:** el flujo actual puede fallar y violar políticas del proveedor. Debe ocultarse o reemplazarse por autenticación nativa.
4. **Pagos/aportes externos:** el diálogo actual de transferencia directa debe ocultarse en el build native o rediseñarse conforme a políticas.
5. **UGC/multiplayer:** Tutti Frutti permite contenido libre sin moderación/reporte/bloqueo visible; Apple Guideline 1.2 es especialmente relevante.
6. **Ads/privacy:** UMP, ATT, App Privacy y Data Safety incorrectos o inconsistentes con los SDKs generan rechazo. No declarar menos ni más de lo que realmente recolecta la build.
7. **YouTube en WebView:** funcionamiento, términos, cookies, autoplay y origen pueden hacer que MusicDLE no pase revisión funcional.
8. **Datos locales:** pérdida de streak/progreso por depender de `localStorage` dañaría ratings aunque no impida la aprobación.
9. **iOS toolchain:** se necesita Mac/Xcode 26, firma, dispositivo real y TestFlight; no puede cerrarse el release iOS sólo desde el entorno Windows actual.
10. **Políticas cambiantes:** target SDK, privacy manifests y formularios cambian. Deben revisarse justo antes de cada submission.

### Mitigación de review

- Entregar credenciales/instrucciones de revisión sólo si existe una ruta protegida; el MVP anónimo evita fricción.
- Describir claramente qué juegos requieren Internet.
- Probar cold start, background/foreground, modo avión, red lenta, rotación, teclado, dark mode y dispositivos con notch.
- Proporcionar Support URL y Privacy Policy estables.
- Completar [App Privacy en App Store Connect](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy) y Data Safety desde el comportamiento real de la build.
- No usar claims de afiliación con franquicias si no existe autorización.

## 15. Required Repository Changes

Ninguno de estos cambios fue realizado durante esta auditoría.

| Archivo/directorio | Cambio requerido |
|---|---|
| `package.json` / `package-lock.json` | Agregar Capacitor/plugins, scripts de build/sync/run y conservar scripts web existentes |
| `angular.json` | Añadir configuración `mobile` client-only; conservar producción web estática/prerender |
| `capacitor.config.ts` (nuevo) | Definir app ID, nombre, `webDir`, comportamiento de plugins y esquema |
| `android/` (nuevo) | Proyecto nativo, manifest, Gradle, resources, iconos, splash, Firebase/AdMob y firma por entorno |
| `ios/` (nuevo) | Proyecto Xcode, Info.plist, entitlements, AppIcon, splash, Firebase/AdMob y Privacy Manifest |
| `.gitignore` | Excluir keystores, credenciales, provisioning/local files, builds y archivos generados sensibles |
| `src/index.html` | Agregar `viewport-fit=cover`, revisar theme color/meta mobile y conservar SEO web |
| `src/styles.css` | Safe-area variables, `100dvh`/fallbacks, touch/keyboard y layout para banners opcionales |
| `src/app/app.config.ts` | Registrar servicios/adaptadores de plataforma, analytics y error handler |
| `src/app/layout/layout.component.ts/.html/.css` | Manejo de back/lifecycle/sidebar, status/keyboard/safe areas y shell mobile |
| `src/app/shared/config/adsense.config.ts` y `ad-slot.component.*` | Asegurar que AdSense sólo se renderice en web; native usa `AdService`/AdMob |
| `src/app/shared/config/firebase.config.ts` | Separar configuración por plataforma/build y documentar que es pública; registrar apps nativas |
| `src/app/shared/services/game-storage.service.ts` | Pasar a la abstracción de persistencia y migración versionada |
| `src/app/shared/services/base-game.service.ts` | Evitar acceso directo a `localStorage`; persistir/resumir mediante adapter |
| `src/app/shared/services/daily-activity.service.ts` | Mantener anonymous auth; desactivar popup en native o migrar a auth nativa; mejorar sync/errors |
| `src/app/shared/services/theme.service.ts` | Usar storage adapter y sincronizar status bar/tema nativo |
| Servicios/componentes con claves de Connections, ChronoDLE, Fútbol Mayor, MusicDLE, RankDLE, PalmoDLE, Serpentile, FutbolDLE y Tutti Frutti | Migrar accesos directos a storage, validar schema/versiones y probar restore |
| `GameManagerService` y finales de juego no centralizados | Emitir eventos comunes de partida para analytics sin duplicar lógica |
| Componentes de share de Banderadle, GeoDLE, ChronoDLE, Fútbol Mayor, Serpentile, RankDLE, PalmoDLE, MusicDLE, FutbolDLE y Tutti Frutti | Usar servicio de Native Share y URL pública fija; no `window.location.origin` |
| MusicDLE/servicios YouTube | Gestionar offline, origen WebView, lifecycle/audio focus, errores y disponibilidad |
| RoscoDLE y otros timers/animaciones | Persistir timestamps, pausar/reconciliar al reanudar |
| Diálogo de soporte | Ocultar transferencia directa en native MVP o reemplazarla por flujo permitido |
| `src/app/pages/site-info/site-info.component.html` | Actualizar Privacy Policy para AdMob, Analytics, Crashlytics, push, consentimiento y derechos del usuario |
| `public/` | Auditar/comprimir/licenciar assets; decidir fallbacks locales para recursos remotos |
| `resources/` o `assets/` nativo (nuevo) | Master icon/splash y archivos fuente para generación |
| `firebase.json` | **Sin cambio obligatorio:** continuar publicando sólo la web en Firebase Hosting |
| `.github/workflows/firebase-hosting-merge.yml` | Conservar pipeline web; si se actualiza Node, validar Angular. No mezclar firma mobile aquí |
| Workflow mobile separado (nuevo, opcional) | Node 22, build/sync, Android AAB; iOS sólo en runner macOS con secretos seguros |
| `android/app/src/main/AndroidManifest.xml` y resources | App ID/AdMob, permisos mínimos, orientación, iconos y configuración de red |
| `ios/App/App/Info.plist`, proyecto/entitlements y `PrivacyInfo.xcprivacy` | Descripciones de permisos, AdMob/SKAdNetwork, ATT si aplica, orientaciones y declaraciones privacy |

## 16. Dependencies To Add

Versionar todos los paquetes en el mismo major de Capacitor y resolver la versión estable exacta al comenzar:

### Base MVP

- `@capacitor/core`
- `@capacitor/cli` (dev dependency)
- `@capacitor/android`
- `@capacitor/ios`
- `@capacitor/app`
- `@capacitor/haptics`
- `@capacitor/share`
- `@capacitor/status-bar`
- `@capacitor/splash-screen`
- `@capacitor/keyboard`
- `@capacitor/preferences`
- `@capacitor/browser` para links externos si se necesita control consistente
- `@capacitor/assets` (dev dependency)

### Ads y observabilidad

- `@capacitor-community/admob` compatible con Capacitor 8
- `@capacitor-firebase/analytics`
- `@capacitor-firebase/crashlytics`
- `stacktrace-js` opcional para mejorar non-fatals JavaScript enviados a Crashlytics

### Post-MVP

- `@capacitor/push-notifications`
- `@capacitor-firebase/authentication` si se habilita Google/Apple login nativo
- `@capacitor/screen-orientation` sólo si se requiere orientación dinámica

El paquete `firebase` existente debe conservarse para Realtime Database y auth web/anónima mientras se diseña cuidadosamente cualquier bridge de autenticación nativa. No instalar Ionic, NgRx, SQLite ni un framework UI nuevo sin una necesidad concreta.

## 17. MVP Scope

El MVP publicable recomendado incluye:

- Un único código Angular compartido y build mobile client-only.
- Shell Capacitor Android/iOS con rutas y juegos existentes.
- Iconos, splash, safe areas, status bar, teclado, orientación portrait y back Android.
- Lifecycle correcto: persistencia, audio y timers al pausar/reanudar.
- Storage abstraction y migración de datos importantes a Preferences.
- Native Share y haptics básicos con fallbacks web.
- Firebase Analytics y Crashlytics con taxonomía mínima.
- Arquitectura AdService y rewarded ads con IDs de prueba; habilitación real sólo luego de consentimiento y QA.
- Offline para juegos con recursos locales; mensajes claros para MusicDLE/multiplayer/recursos remotos.
- Auth anónima; login Google oculto en native.
- Diálogo de transferencia oculto en native.
- Privacy Policy/Data Safety/App Privacy actualizadas.
- Auditoría de contenido y selección de un catálogo cuyo derecho de publicación esté confirmado.
- Internal testing Android y TestFlight iOS en dispositivos reales.

Para reducir riesgo, la primera submission podría excluir temporalmente MusicDLE y/o Tutti Frutti si sus pruebas de WebView, contenido o moderación no quedan cerradas. Eso no requiere eliminar el código web: se puede usar feature gating por plataforma.

## 18. Post-MVP

- Push notifications FCM/APNs con opt-in contextual y deep links.
- Interstitials con frequency cap medido y Remote Config/configuración simple.
- Login opcional nativo Google + Apple, linking de cuenta, eliminación y sync multi-dispositivo.
- App Check con enforcement gradual.
- PWA/service worker para mejorar instalación y offline web.
- Descarga/cache autorizado de skins u otros recursos remotos, si sus términos lo permiten.
- Moderación, reporte/bloqueo y controles de abuso en Tutti Frutti.
- Limpieza/TTL de salas y reglas RTDB más estrictas.
- Optimización adicional de imágenes/audio y medición de startup.
- Deep links universales/App Links.
- Leaderboard sólo con validación confiable; evitar aceptar puntuaciones arbitrarias del cliente.

Opcionales: banners, SQLite, orientación dinámica, app-open ads y automatización de campañas push. Ninguno es necesario para validar el producto.

## 19. Implementation Plan

### Fase 0 — Decisiones y derechos

1. Confirmar nombre, `applicationId`/Bundle ID y ownership de cuentas Google/Apple/Firebase/AdMob.
2. Cerrar inventario de licencias/contenido y decidir qué juegos entran al release native.
3. Definir política de privacidad, monetización y regiones/edad objetivo.

### Fase 1 — Base Capacitor sin features nuevas

1. Agregar configuración Angular mobile client-only y Capacitor 8.
2. Generar Android/iOS y recursos nativos.
3. Ejecutar todos los juegos en emulador y dispositivos reales.
4. Corregir safe areas, viewport, teclado, back, links externos y orientación.
5. Mantener el build y deploy web sin cambios funcionales.

**Checkpoint:** web sigue funcionando; Android/iOS inician completamente desde assets locales y navegan todas las rutas.

### Fase 2 — Plataforma y persistencia

1. Crear adaptadores Platform, Storage, Share, Haptics y Lifecycle.
2. Migrar claves de `localStorage` a Preferences con pruebas de upgrade.
3. Reconciliar timers/audio/background y conectividad.
4. Corregir URLs compartidas y comportamiento offline.
5. Ocultar login popup y soporte por transferencia en native.

**Checkpoint:** progreso/streak sobreviven reinicios; background no regala/quita tiempo; modo avión degrada por feature.

### Fase 3 — Firebase y observabilidad

1. Registrar apps Android/iOS en Firebase.
2. Integrar Analytics y eventos comunes.
3. Integrar Crashlytics, non-fatals y simbolicación.
4. Revisar reglas RTDB y probar auth anónima/reconexión.
5. Validar que no se recolecten respuestas ni PII accidental.

**Checkpoint:** dashboards muestran sesiones/partidas y un crash controlado simbolicado.

### Fase 4 — Ads de prueba

1. Implementar `AdService` web/native.
2. Configurar UMP/consentimiento y ATT sólo si aplica.
3. Implementar primero rewarded ads con IDs de prueba y recompensa idempotente.
4. QA de cierre/error/offline/background.
5. Añadir interstitials sólo después del lanzamiento inicial o de datos suficientes.

**Checkpoint:** ninguna recompensa se concede sin callback; no hay unidades reales en builds de desarrollo.

### Fase 5 — Store readiness

1. Completar iconos, screenshots, fichas, privacy forms, content rating y soporte.
2. Firmar Android, generar AAB y pasar internal/closed testing.
3. Firmar iOS en Mac, subir a TestFlight y probar en iPhone/iPad soportados.
4. Corregir issues de review, accesibilidad, performance y contenido.
5. Hacer rollout gradual, monitorear Crashlytics/Analytics y conservar rollback mediante nueva versión.

La implementación debe dividirse en cambios pequeños y verificables. No es necesario crear microservicios, introducir login obligatorio, reemplazar Angular ni agregar un store global.

## Final Recommendation

**Viability: HIGH**

**Recommended stack:** Angular 19 compartido + build web estático/prerender en Firebase Hosting + build mobile client-only con Capacitor 8 + Android/iOS nativos + AdMob mediante `@capacitor-community/admob` + Firebase Analytics/Crashlytics mediante plugins Capacitor. Firebase Auth anónima y Realtime Database pueden mantenerse; PWA queda como mejora separada para web.

**Estimated complexity:**

- Android: **MEDIUM** — toolchain, lifecycle, storage, ads, firma y Play testing; la base web es reutilizable.
- iOS: **MEDIUM-HIGH** — requiere Mac/Xcode, signing, ATT/privacy, TestFlight y revisión más sensible de WebView/contenido.
- Ads: **MEDIUM** — el SDK es viable, pero recompensa idempotente, consentimiento y QA requieren cuidado.
- Store publication: **MEDIUM-HIGH** — el mayor trabajo no es Capacitor, sino privacidad, contenido/IP, moderación y cumplimiento de políticas.

**Biggest risks:** derechos de contenido y música; MusicDLE/YouTube en WebView; login Google embebido; pérdida de datos por `localStorage`; texto de usuarios en Tutti Frutti; aporte externo por transferencia; Apple Guideline 4.2; y configuración exacta de consentimiento/privacidad de AdMob y Firebase.

**Recommended first step:** confirmar el catálogo autorizado y los identificadores definitivos; luego crear una prueba técnica mínima en una rama con build Angular mobile client-only + Capacitor 8, sin anuncios reales, y ejecutar en un Android y un iPhone físicos. El primer criterio de éxito debe ser que web permanezca intacta y que rutas, storage, audio, MusicDLE, background/foreground y modo offline funcionen de forma predecible.
