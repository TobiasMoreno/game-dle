# MusicDLE: ideas posteriores al MVP

Estas funciones quedan explícitamente fuera de la primera versión.

## Estadísticas y progresión

Una futura versión puede guardar, de forma global y local:

- partidas jugadas, ganadas y perdidas;
- porcentaje de aciertos;
- racha actual y mejor racha;
- distribución de victorias por intento y segundos escuchados;
- cantidad de pases y respuestas incorrectas;
- historial reciente sin revelar respuestas de rondas activas.

No se contemplan niveles ni estadísticas separadas por categoría en este momento. Antes de incorporar estadísticas conviene definir un modelo versionado, migraciones de `localStorage`, criterios para rondas abandonadas y pruebas de compatibilidad con datos antiguos.

## Posibles extensiones

- Sesiones curadas o playlists temáticas.
- Catálogo administrable desde un backend.
- Control automático de disponibilidad y restricciones regionales.
- Sincronización entre dispositivos y perfiles.
- Moderación, importación y validación editorial de catálogos grandes.
- Proveedor de previews de audio autorizado como alternativa a YouTube.
