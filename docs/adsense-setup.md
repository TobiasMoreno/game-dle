# Configuración de AdSense

El publisher global de `game-dle` es `ca-pub-9225896761341125`. El script de AdSense y la meta de verificación están en `src/index.html`; el inventario autorizado está publicado mediante `public/ads.txt`.

## Unidades configuradas

Las dos unidades **Display responsive** están configuradas en `src/app/shared/config/adsense.config.ts`:

1. `game-dle-home`: `1844562103`
2. `game-dle-game-footer`: `6525063208`

La configuración resultante es:

```ts
slots: {
  home: '1844562103',
  gameFooter: '6525063208',
}
```

Desarrollo muestra una maqueta identificada y no solicita anuncios reales. El build de producción inicializa cada unidad una sola vez.

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
