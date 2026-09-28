# Acciones pendientes — release móvil 1.0.0

La preparación reproducible dentro del repositorio está terminada. Este documento contiene únicamente las acciones que requieren decisiones, cuentas, credenciales, hardware real o aprobación de Google/Apple.

No marcar una acción como completada sin conservar una evidencia verificable. Después de cada cierre, actualizar la clave correspondiente en `store/release-state.json`. Nunca guardar contraseñas, keystores, certificados privados ni perfiles de aprovisionamiento en Git.

## Resumen de pendientes

|   # | Acción                                                                                | Dependencia               | Evidencia de cierre                                            | Estado asociado               |
| --: | ------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------- | ----------------------------- |
|   1 | Confirmar que `com.gamedle.app` pertenece a las cuentas definitivas de Google y Apple | Ninguna                   | Captura o registro interno de ambas cuentas                    | `bundleIdOwnershipConfirmed`  |
|   2 | Cerrar la revisión de derechos de música, imágenes, personajes, escudos y marcas      | Ninguna                   | Inventario aprobado con fuente/licencia por catálogo           | `contentRightsReviewed`       |
|   3 | Crear GameDLE en Google Play Console                                                  | 1 y 2                     | Aplicación visible con package name `com.gamedle.app`          | `googlePlayAppCreated`        |
|   4 | Habilitar Play App Signing                                                            | 3                         | Estado activo en Play Console                                  | `playAppSigningEnabled`       |
|   5 | Crear, respaldar y probar el upload key de Android                                    | 3 y 4                     | Keystore fuera de Git, copia de respaldo y certificado público | `androidUploadKeySecured`     |
|   6 | Aprobar el ciclo de Internal testing de Google Play                                   | 5, 11, 12, 13, 14 y 16    | Instalación/actualización desde Play y QA aprobado             | `androidInternalTrackPassed`  |
|   7 | Registrar el App ID explícito de Apple                                                | 1 y 2                     | Identificador `com.gamedle.app` activo en Apple Developer      | `appleAppIdCreated`           |
|   8 | Crear la ficha en App Store Connect                                                   | 7                         | App y versión `1.0.0` visibles                                 | `appStoreRecordCreated`       |
|   9 | Completar contratos, datos fiscales y bancarios que Apple solicite                    | 8                         | Agreements sin acciones pendientes                             | `appleAgreementsCompleted`    |
|  10 | Aprobar el ciclo de TestFlight en iPhone y iPad                                       | 8, 9, 11, 12, 13, 15 y 16 | Build procesado e informe de QA aprobado                       | `testFlightPassed`            |
|  11 | Completar Data safety y App Privacy                                                   | 3 y 8                     | Formularios enviados en ambas stores                           | `privacyFormsSubmitted`       |
|  12 | Completar Content rating, Age rating y audiencia objetivo                             | 3 y 8                     | Clasificaciones publicadas sin cuestionarios pendientes        | `contentRatingSubmitted`      |
|  13 | Crear las unidades AdMob de producción                                                | 3 y 8                     | App/unidades aprobadas y consentimiento revisado               | `productionAdUnitsConfigured` |
|  14 | Completar QA en Android real                                                          | 6                         | Matriz Android firmada por el responsable de QA                | `androidRealDeviceQaPassed`   |
|  15 | Completar QA en iPhone/iPad real                                                      | 10                        | Matriz iOS/iPadOS firmada por el responsable de QA             | `iosRealDeviceQaPassed`       |
|  16 | Reemplazar los IDs de demostración de AdMob sólo para el rollout monetizado           | 13, 14 y 15               | `npm run store:validate:strict` deja de detectar IDs de prueba | Validación automática         |

## 1. Decisiones y derechos

- [ ] Definir las cuentas propietarias de Google Play Console, Apple Developer, App Store Connect, Firebase y AdMob.
- [ ] Confirmar por escrito que el package/Bundle ID definitivo es `com.gamedle.app`.
- [ ] Revisar cada catálogo y documentar fuente, licencia, atribución, territorio y vencimiento cuando corresponda.
- [ ] Retirar del release móvil cualquier contenido cuyo permiso no pueda demostrarse.
- [ ] Verificar que política de privacidad, términos, soporte y solicitud de eliminación sean públicos y accesibles desde la app.
- [ ] Al terminar, cambiar `bundleIdOwnershipConfirmed` y `contentRightsReviewed` a `true`.

## 2. Google Play

### Cuenta y ficha

- [ ] Crear la aplicación en Play Console con package name `com.gamedle.app`.
- [ ] Cargar los textos de `store/listing.es-AR.json`.
- [ ] Cargar el icono, feature graphic y capturas de `store/assets/google-play/`.
- [ ] Completar Store listing, App access, Ads, Target audience, Data safety y Content rating.
- [ ] Habilitar Play App Signing.

### Firma y AAB

- [ ] Crear el upload key fuera del repositorio y guardarlo en un gestor seguro con una copia de respaldo.
- [ ] Exportar y conservar su certificado público para Play Console.
- [ ] Copiar `android/keystore.properties.example` como `android/keystore.properties` y completar localmente las cuatro variables `GAME_DLE_UPLOAD_*`.
- [ ] Incrementar `GAME_DLE_VERSION_CODE` para cada upload posterior; nunca reutilizar un version code aceptado.
- [ ] Generar el artefacto publicable con:

```powershell
npm run mobile:android:aab
```

- [ ] Confirmar que el comando termina correctamente y verificar la firma antes de subir:

```powershell
jarsigner -verify -verbose -certs android\app\build\outputs\bundle\release\app-release.aab
```

- [ ] Subir el AAB firmado a Internal testing. No subir el AAB producido por `mobile:android:aab:check`: es sólo una prueba estructural sin firma.

### Internal testing y QA Android

- [ ] Instalar desde Google Play y probar una actualización sobre la versión anterior.
- [ ] Probar al menos API 24, 29, 34 y 36; teléfono y tablet; claro/oscuro; online/offline; foreground/background.
- [ ] Validar inicio, navegación, progreso, compartir, enlaces, teclado, audio y safe areas.
- [ ] Validar login opcional, MusicDLE, Tutti Frutti, Analytics, Crashlytics, UMP y rewarded ads.
- [ ] Confirmar que una recompensa sólo se concede después del callback y una sola vez.
- [ ] Revisar Android Vitals, crashes, ANR y errores de inicio durante al menos 24 horas.
- [ ] Al aprobar, cambiar `androidInternalTrackPassed` y `androidRealDeviceQaPassed` a `true`.

## 3. Apple / TestFlight

### Cuenta y ficha

- [ ] Registrar un App ID explícito para `com.gamedle.app` en Apple Developer.
- [ ] Crear GameDLE y su versión `1.0.0` en App Store Connect.
- [ ] Completar los agreements y datos administrativos solicitados.
- [ ] Cargar los textos de `store/listing.es-AR.json`.
- [ ] Cargar y revisar las capturas de iPhone e iPad de `store/assets/app-store/`.
- [ ] Completar App Privacy, Age Rating, Ads, export compliance y datos para App Review.

### Firma y TestFlight

- [ ] En una Mac, abrir `ios/App/App.xcodeproj`, seleccionar el Team propietario y comprobar la firma automática.
- [ ] Incrementar `CURRENT_PROJECT_VERSION` antes de cada upload; conservar `MARKETING_VERSION=1.0.0` para esta versión.
- [ ] Ejecutar `npm run build:mobile` y `npx cap sync ios`.
- [ ] Archivar la configuración Release en Xcode, validar el archive y distribuirlo a App Store Connect.
- [ ] Esperar el procesamiento, completar compliance y habilitar el build para TestFlight.

### QA iPhone/iPad

- [ ] Probar iOS 15 y la versión estable vigente en iPhone y iPad reales.
- [ ] Validar instalación/actualización, inicio, navegación, persistencia, login opcional y compartir.
- [ ] Validar safe areas, teclado, rotación declarada, audio, enlaces externos y restauración desde background.
- [ ] Validar Analytics, Crashlytics, consentimiento y anuncios recompensados.
- [ ] Comparar las capturas generadas con la UI del build nativo y reemplazarlas si difieren.
- [ ] Al aprobar, cambiar `testFlightPassed` y `iosRealDeviceQaPassed` a `true`.

## 4. Privacidad, clasificación y anuncios

- [ ] Usar `store/privacy-data-map.md` como base, pero contrastarlo con el comportamiento real de Firebase, AdMob y login antes de enviar formularios.
- [ ] Completar Data safety en Google Play y App Privacy en App Store Connect con respuestas consistentes.
- [ ] Completar clasificación por edades, audiencia objetivo y presencia de anuncios en ambas stores.
- [ ] Crear las apps/unidades reales en AdMob y enlazar las fichas cuando estén disponibles.
- [ ] Mantener IDs oficiales de demostración durante desarrollo, CI, emuladores y QA inicial.
- [ ] Reemplazar los IDs de demostración sólo después de aprobar consentimiento y QA real; repetir tests y ambos ciclos de testing.
- [ ] Al terminar, cambiar `privacyFormsSubmitted`, `contentRatingSubmitted` y `productionAdUnitsConfigured` a `true`.

## 5. Preflight obligatorio

Ejecutar desde un commit limpio y conservar el log:

```powershell
npm ci
npm run test:ci
npm run build
npm run build:mobile
npm run store:validate:strict
git diff --check
```

El preflight sólo está aprobado cuando:

- [ ] Todos los comandos terminan con código 0.
- [ ] `store/release-state.json` no contiene pendientes falsos.
- [ ] No quedan IDs publicitarios de demostración en el build de producción.
- [ ] No existen secretos, certificados privados ni perfiles dentro de Git.
- [ ] Las URLs de privacidad, soporte y eliminación responden públicamente.
- [ ] Las versiones y notas coinciden con lo cargado en ambas stores.

## 6. Rollout y rollback

- [ ] Mantener al menos 24 horas de telemetría limpia en internal/closed testing.
- [ ] Iniciar un rollout gradual sugerido de 5% → 20% → 50% → 100%, con una ventana de observación entre pasos.
- [ ] Monitorear Crashlytics, Analytics, Android Vitals, ANR y reseñas después de cada incremento.
- [ ] Detener el rollout ante crashes, fallos de inicio/login, pérdida de progreso o regresiones materiales.
- [ ] Crear un tag del release y conservar los artefactos y símbolos correspondientes.
- [ ] Para rollback, preparar un hotfix con `versionCode` y build number mayores: las stores no permiten restaurar directamente un binario anterior.

## Notas para App Review

GameDLE funciona sin cuenta obligatoria. El login con Google sólo vincula actividad opcional. No existen compras ni apuestas. Los anuncios recompensados son opcionales y no bloquean el acceso. Cuando exista el primer placement real, indicar al equipo de revisión el juego y el botón exactos para probarlo. Tutti Frutti requiere dos participantes para validar el flujo multijugador.

Referencias oficiales: [firma y Play App Signing](https://developer.android.com/studio/publish/app-signing), [subida de App Bundles](https://developer.android.com/studio/publish/upload-bundle), [recursos de Google Play](https://support.google.com/googleplay/android-developer/answer/9866151), [perfiles de distribución de Apple](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile), [capturas de App Store](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications) y [App Privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy).
