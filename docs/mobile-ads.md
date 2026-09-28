# Publicidad mobile

La fase 4 integra `@capacitor-community/admob` exclusivamente con IDs oficiales de prueba. AdSense sigue siendo una implementación web separada; el build nativo no renderiza sus slots.

## Flujo recompensado

Los juegos consumen `AdService.showRewardedAd(request, grantReward)`. El callback se ejecuta solamente después del evento nativo de recompensa y recibe un `transactionId` que el juego debe guardar junto con el beneficio para que su propia mutación también sea idempotente.

```ts
const outcome = await adService.showRewardedAd(
  {
    gameId: 'wordle',
    placement: 'hint',
    rewardType: 'hint',
  },
  async (transactionId) => {
    // Si transactionId ya fue aplicado, no volver a otorgar la recompensa.
    // Persistir el beneficio y el ID en una misma operación del juego.
  }
);
```

El servicio bloquea de forma segura las solicitudes sin red, en background, sin consentimiento o concurrentes. Persiste el estado antes de mostrar, ignora eventos duplicados, no recompensa un cierre anticipado y precarga nuevamente al terminar.

## Consentimiento y privacidad

- UMP se consulta antes de cargar anuncios.
- La entrada a las opciones de privacidad aparece en `/privacidad` cuando UMP la requiere.
- Los requests actuales usan `npa: true`.
- Android elimina el permiso `AD_ID`; iOS no solicita ATT.
- Analytics recibe solamente IDs técnicos de juego/placement, resultado y códigos de error cerrados.

## Antes de producción

1. Registrar `com.gamedle.app` en AdMob para Android e iOS.
2. Crear las unidades rewarded reales y reemplazar los IDs de muestra en `admob.config.ts`, `strings.xml` e `Info.plist`.
3. Publicar los mensajes UMP aplicables desde AdMob y probar sus variantes regionales.
4. Revisar Data Safety y App Privacy contra el comportamiento final.
5. Decidir si se habilitan anuncios personalizados. Si cambia la decisión actual, revisar `AD_ID`, ATT, `NSUserTrackingUsageDescription` y las señales de consentimiento antes de modificar el código.
6. Validar recompensa, cierre, error, modo avión y background en Android/iOS reales.

Banners, interstitials y unidades reales permanecen fuera del MVP de esta fase.
