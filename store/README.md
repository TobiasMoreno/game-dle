# Publicación móvil

Este directorio contiene el paquete de preparación para Google Play y App Store Connect. Los textos están en `listing.es-AR.json`, los recursos visuales en `assets/` y el estado de los requisitos externos en `release-state.json`.

## Comandos

- `npm run store:assets`: regenera screenshots y feature graphic desde el build móvil usando Chrome.
- `npm run store:validate`: valida versiones, límites de textos, URLs, tamaños y formatos; informa los bloqueos externos sin fallar.
- `npm run store:validate:strict`: debe quedar verde antes de enviar a revisión.
- `npm run mobile:android:aab:check`: compila un AAB release optimizado sin firma, sólo para verificar R8 y recursos.
- `npm run mobile:android:aab`: exige el upload key y genera el AAB firmado para Play Console.

## Firma Android

1. Crear y respaldar un upload key fuera del repositorio.
2. Copiar `android/keystore.properties.example` como `android/keystore.properties`.
3. Completar las cuatro variables `GAME_DLE_UPLOAD_*`. En CI pueden definirse directamente como variables de entorno.
4. Ejecutar `npm run mobile:android:aab` y conservar el certificado público junto al registro de Play App Signing.

Nunca guardar el keystore, contraseñas, certificados privados ni perfiles de aprovisionamiento en Git. Google exige firmar el App Bundle con un upload key y usa Play App Signing para la distribución final.

## iOS

El proyecto usa firma automática. En una Mac con Xcode se debe seleccionar el Team propietario de `com.gamedle.app`, archivar la configuración Release y distribuirla a App Store Connect. El build number (`CURRENT_PROJECT_VERSION`) debe incrementarse en cada upload y la versión visible (`MARKETING_VERSION`) al publicar una nueva versión.

## Recursos

- Google Play: icono 512×512, feature graphic 1024×500 y capturas 1080×1920.
- App Store: capturas iPhone de 1290×2796 e iPad de 2048×2732, sin canal alpha. Antes del envío deben compararse con Xcode Simulator o dispositivos reales.
- Las capturas generadas son un punto de partida reproducible. Deben revisarse para confirmar que no exhiben errores de red, contenido de terceros no autorizado ni datos personales.

## Bloqueos humanos

Actualizar `release-state.json` únicamente después de completar cada acción en la cuenta correspondiente. Los formularios de privacidad y clasificación no se pueden enviar desde el repositorio y requieren confirmar el comportamiento de todos los SDK y los derechos de cada catálogo.

Referencias oficiales: [assets de Google Play](https://support.google.com/googleplay/android-developer/answer/9866151), [firma Android](https://developer.android.com/studio/publish/app-signing), [capturas de App Store](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications) y [privacidad de App Store](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy).
