# MusicDLE: alcance del MVP

MusicDLE es un modo musical original de `game-dle`, pensado para jugar rondas consecutivas y no una única canción diaria. Funciona completamente en el frontend y usa la API de YouTube IFrame para reproducir cada fragmento.

## Mecánica aprobada

- Ruta: `/games/musicdle`.
- Rondas ilimitadas, sin niveles.
- Cada ronda empieza con 5 segundos y permite hasta 6 intentos.
- Una respuesta incorrecta o pasar consume un intento y suma 5 segundos, hasta un máximo de 30.
- Volver a reproducir el fragmento desbloqueado no consume intentos.
- La respuesta se elige mediante autocompletado; busca por título, artista y aliases.
- Al ganar o perder se revela la canción y se habilita el video completo de YouTube.
- La siguiente ronda conserva el filtro, pero no empieza a reproducirse hasta que el usuario lo solicita.
- El resultado se puede compartir sin incluir el nombre de la canción.

## Selección y persistencia

El usuario puede jugar con todo el catálogo o filtrar por género, década o idioma. La canción se elige al azar dentro del filtro activo.

Las canciones jugadas y los videos reportados como no disponibles entran en una lista de espera individual de 24 horas en `localStorage`. Una vez vencido ese tiempo vuelven automáticamente al conjunto elegible. Si todo el conjunto filtrado está en espera, la interfaz informa que no hay canciones disponibles para ese filtro.

La ronda activa, sus intentos, los segundos desbloqueados y el filtro se guardan en `localStorage`. Una recarga restaura la ronda exacta. Este almacenamiento está versionado y aislado del estado de los juegos diarios existentes.

## Catálogo

El archivo fuente es `public/musicdle-songs.json`. Cada entrada tiene este esquema:

```json
{
  "id": "artista-cancion",
  "title": "Título",
  "artist": "Artista",
  "aliases": ["Otra forma de buscarla"],
  "genres": ["Pop"],
  "decade": 2020,
  "language": "Español",
  "youtubeVideoId": "abcdefghijk",
  "startSeconds": 30,
  "enabled": true
}
```

Para sumar canciones:

1. Usar un ID estable y único.
2. Confirmar que el video permite reproducción embebida.
3. Elegir manualmente un `startSeconds` reconocible y verificar el recorte de 5 a 30 segundos.
4. Incorporar aliases útiles sin crear respuestas duplicadas.
5. Ejecutar `npm run validate:musicdle` antes de publicar.

El catálogo inicial contiene 60 canciones en español e inglés. Como YouTube puede retirar, bloquear por región o impedir la reproducción embebida en cualquier momento, el estado de cada video debe revisarse periódicamente. El cliente captura errores del reproductor y aparta el video durante 24 horas, pero no puede garantizar disponibilidad global.

## Restricciones conocidas

- YouTube muestra su reproductor durante la ronda y puede exponer información visual o contextual propia de la plataforma.
- Un frontend estático no puede ocultar el catálogo ni impedir que una persona inspeccione la respuesta.
- Autoplay con sonido está limitado por los navegadores; cada reproducción requiere interacción del usuario.
- La disponibilidad y las políticas de YouTube son externas a `game-dle`.
