# Configuración de AdSense

El publisher global de `game-dle` es `ca-pub-9225896761341125`. El script de AdSense y la meta de verificación están en `src/index.html`; el inventario autorizado está publicado mediante `public/ads.txt`.

## Unidades pendientes

Crear en AdSense dos unidades **Display responsive**:

1. `game-dle-home`
2. `game-dle-game-footer`

Copiar únicamente el valor numérico de `data-ad-slot` de cada unidad en `src/app/shared/config/adsense.config.ts`:

```ts
slots: {
  home: 'ID_NUMERICO_DE_HOME',
  gameFooter: 'ID_NUMERICO_DE_GAME_FOOTER',
}
```

No usar el publisher ID como slot. Mientras los valores estén vacíos, desarrollo muestra una maqueta identificada y producción no realiza solicitudes de anuncios.

## Ubicaciones

- Home: después del listado de juegos y antes de la ayuda.
- Juegos diarios: al final de estadísticas y contenido, antes del footer.
- MusicDLE: excluido durante el MVP porque su tablero ocupa el viewport completo y sus botones de reproducción, respuesta y siguiente canción no dejan una separación segura.

Las unidades se inicializan una sola vez al entrar a una página. No se refrescan con intentos, respuestas o rondas.

## Antes de producción

- Configurar en AdSense `Privacy & messaging` y publicar el mensaje de consentimiento correspondiente al tráfico objetivo.
- Verificar `https://DOMINIO/ads.txt`.
- Confirmar que AdSense muestre el sitio como `Ready`.
- Probar las unidades en desktop y móvil sin hacer clic sobre anuncios propios.
- Mantener publicidad separada de botones, navegación, desplegables, tableros y reproductores.
