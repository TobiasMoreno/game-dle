# AdSense: configuración y operación

Actualizado el 15 de septiembre de 2026. Dominio confirmado: `game-dle.web.app`.

## Estado de esta versión

- Publisher: `ca-pub-9225896761341125`.
- Verificación: meta `google-adsense-account` en `src/index.html`.
- Autorización: `public/ads.txt`, copiado a `dist/game-dle/browser/ads.txt` y publicado en `/ads.txt`.
- Unidades conservadas en `src/app/shared/config/adsense.config.ts`: portada `1844562103`, pie de juego `6525063208`.
- Solicitudes deshabilitadas mediante `ADSENSE_CONFIG.enabled = false`; script publicitario global retirado.
- Desarrollo puede mostrar una maqueta identificada, sin solicitar anuncios reales.

La desactivación es una decisión de esta implementación: no se acreditaron aprobación y CMP efectiva. Google no exige aquí retirar el script como condición de revisión. La meta mantiene la vía de verificación.

## Build y publicación

```powershell
npm run build
npm run validate:musicdle
npm run validate:geodle
firebase deploy --only hosting --project game-dle
npm run validate:hosting
```

prebuild genera sitemap y resumen de catálogos. postbuild comprueba todas las rutas públicas y detiene el comando si encuentra errores. Firebase publica los deep links prerenderizados, sin catch-all hacia portada. 404.html atiende desconocidas; index.csr.html queda excluido.

## Reactivación

1. Comprobar aprobación y publisher en AdSense.
2. Configurar y probar mensaje de privacidad y CMP certificada aplicable, incluida su integración con las solicitudes. El repositorio no incorpora una CMP propia ni demuestra consentimiento.
3. Restituir en src/index.html el script asíncrono oficial `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9225896761341125`, con crossorigin="anonymous", y habilitar ADSENSE_CONFIG.enabled una vez verificada esa integración. Cambiar solamente el flag no instala script ni CMP.
4. Comprobar consentimiento, rechazo, preferencias y ubicaciones en escritorio y móvil antes de publicar la reactivación.

Las unidades manuales no se refrescan por cada intento. No agregar publicidad a legales o biblioteca ni confundir consentimiento publicitario con aceptación de términos de una sala.

## Acciones de cuenta

En AdSense: confirmar game-dle.web.app, actualizar comprobación de ads.txt y solicitar revisión. En Search Console: enviar /sitemap.xml e inspeccionar portada, juegos y biblioteca. Estas acciones requieren acceso y no se han acreditado como realizadas.

«No encontrado» en el panel no prueba un fallo de Hosting: la auditoría inicial comprobó HTTP 200 y texto correcto, también con agentes de Google. La actualización depende de su rastreo.

Ver [auditoría y ejecución](adsense-auditoria-tecnica-2026-09-15.md).
