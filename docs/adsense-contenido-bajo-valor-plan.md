# Plan de AdSense actualizado

Fecha: 15 de septiembre de 2026.

El diagnóstico vigente está en [la auditoría técnica completa](adsense-auditoria-tecnica-2026-09-15.md). Este documento reemplaza el plan histórico: sus afirmaciones sobre ausencia de legales, sitemap y prerender ya no describían el repositorio.

## Implementado

- Datos locales para prerender de GeoDLE, MusicDLE y cuatro modos LoL, sin servidor HTTP durante el build.
- Reglas, metodología, referencias y FAQ visibles en los cuatro modos LoL.
- Corrección de reglas GeoDLE, normalización Wordle y mecánica/puntuación Serpentile.
- H1 principal por página; títulos vacíos corregidos.
- Footer con cuatro páginas de confianza también en Tutti Frutti.
- Biblioteca: Cómo jugar, nueve guías, FAQ, Metodología, Historia, índice de Rankings y ocho categorías con contexto y referencias.
- 47 páginas canónicas en src/app/public-pages.json, utilizado por rutas y sitemap.
- 404 reales y exclusión del shell CSR; /home conservado como 301 hacia /.
- Validación automática del HTML inicial, enlaces, metadatos, H1, sitemap y ads.txt, local y remota.
- Publicidad deshabilitada, conservando meta y ads.txt. No se presume CMP configurada.

## Acciones externas

No se han marcado como completadas:

- Estado en AdSense, actualización de ads.txt y nueva solicitud de revisión.
- Configuración y prueba de CMP antes de reactivar publicidad.
- Envío de sitemap e inspecciones en Search Console.
- Acreditación de licencias; ver [inventario](recursos-terceros.md).

Estas cuestiones no se resuelven cambiando Angular. No hay una cantidad de palabras o páginas que garantice aprobación. Los controles de extensión editorial protegen contra regresiones; no son un umbral de Google.

Ver [operación](adsense-setup.md) y resultados de pruebas/despliegue al final de la auditoría.
