# Mapa de datos para las stores

Este documento es una base conservadora para completar Data safety y App Privacy. No reemplaza la revisión de las consolas: las respuestas deben incluir el comportamiento efectivo de GameDLE y de cada tercero en la versión enviada.

| Fuente               | Datos potenciales                                                                            | Finalidad                                   | Vinculación                                          | Observaciones                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Firebase Auth        | ID de usuario; nombre y email sólo si se vincula Google                                      | Funcionalidad, cuenta, sincronización       | Vinculados a la cuenta o UID anónimo                 | El acceso básico no exige vincular Google.                                                            |
| Realtime Database    | Actividad diaria, progreso sincronizado, salas, apodo, respuestas y puntajes de Tutti Frutti | Funcionalidad multijugador y sincronización | Vinculados al UID temporal o de cuenta               | Confirmar retención y mecanismo operativo de eliminación.                                             |
| Firebase Analytics   | ID de instalación, pantalla, sesión e interacción agregada                                   | Analítica                                   | Puede asociarse a un identificador de instalación    | No se envían respuestas, búsquedas, apodos, códigos de sala ni texto libre.                           |
| Firebase Crashlytics | Crash logs, diagnósticos, versión y datos técnicos del dispositivo                           | Funcionalidad y diagnóstico                 | Puede asociarse a un identificador de instalación    | Los símbolos de release deben cargarse.                                                               |
| Google AdMob/UMP     | Dirección IP, datos técnicos, interacción y datos publicitarios permitidos                   | Publicidad, medición, seguridad y fraude    | Según consentimiento y SDK                           | Actualmente `npa: true`, sin IDFA/ATT y sin permiso `AD_ID`; confirmar nuevamente al usar IDs reales. |
| YouTube embebido     | Interacciones y datos técnicos procesados por YouTube                                        | Reproducción de MusicDLE                    | Según políticas de Google/YouTube                    | Revisar que el uso móvil cumpla términos y experiencia de WebView.                                    |
| Almacenamiento local | Preferencias, progreso, estadísticas, rachas y respuestas                                    | Funcionalidad                               | Sólo en el dispositivo salvo funciones sincronizadas | El usuario puede borrarlo eliminando los datos de la app.                                             |

## Declaración inicial recomendada

- Marcar que la app y terceros recopilan datos.
- Declarar identificadores, uso del producto, diagnósticos, contenido del usuario y datos de contacto opcionales.
- Declarar publicidad de terceros y analítica donde corresponda, incluso si los anuncios no son personalizados.
- No declarar tracking entre apps mientras se mantengan `npa: true`, ausencia de `AD_ID`/IDFA y ninguna combinación de datos para tracking. Si esto cambia, revisar código, ATT, política y formularios antes del release.
- Usar `https://game-dle.web.app/privacidad` como Privacy Policy URL y `https://game-dle.web.app/privacidad#opciones` como Privacy Choices URL.

Antes de publicar, contrastar este mapa con las fichas de seguridad de Firebase, AdMob, Capacitor y YouTube vigentes en la fecha del envío.
