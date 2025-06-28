# Game-DLE 🎮

Una colección de juegos diarios inspirados en Wordle, construida con Angular y Tailwind CSS.

## 🚀 Características

- **Sistema de navegación**: Rutas de Angular para cambiar entre juegos
- **Persistencia local**: Almacenamiento con localStorage para guardar progreso y estadísticas
- **Actualización diaria**: Los juegos se resetean automáticamente cada día
- **Diseño responsivo**: Interfaz moderna y limpia con Tailwind CSS
- **Estructura modular**: Cada juego es un componente independiente
- **Estadísticas**: Seguimiento de victorias, rachas y distribución de intentos

## 🎯 Juegos Disponibles

### Wordle ✅
- Adivina la palabra de 5 letras en 6 intentos
- Feedback visual con colores (verde = correcto, amarillo = presente, gris = ausente)
- Palabras en español

### Numberle 🔢 (Próximamente)
- Adivina el número en 6 intentos
- Feedback numérico

### Colorle 🎨 (Próximamente)
- Adivina el color en 6 intentos
- Feedback de colores

## 🛠️ Tecnologías

- **Angular 19**: Framework principal
- **Tailwind CSS**: Estilos y diseño
- **Font Awesome**: Iconos
- **TypeScript**: Tipado estático
- **localStorage**: Persistencia de datos

## 📦 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd game-dle
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm start
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:4200
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── games/                 # Juegos individuales
│   │   ├── wordle/           # Juego Wordle
│   │   ├── numberle/         # Juego Numberle (placeholder)
│   │   └── colorle/          # Juego Colorle (placeholder)
│   ├── layout/               # Componentes de layout
│   │   ├── sidebar/          # Barra lateral con navegación
│   │   └── layout.component  # Layout principal
│   ├── pages/                # Páginas principales
│   │   └── home/             # Página de inicio
│   └── shared/               # Componentes y servicios compartidos
│       ├── components/       # Componentes reutilizables
│       │   └── base-game/    # Componente base para juegos
│       ├── models/           # Interfaces y tipos
│       └── services/         # Servicios de lógica de negocio
│           ├── game-manager.service    # Gestión de juegos
│           └── game-storage.service    # Almacenamiento local
```

## 🎮 Cómo Jugar

1. **Navegar**: Usa el sidebar para seleccionar un juego
2. **Jugar**: Cada juego tiene sus propias reglas y mecánicas
3. **Progreso**: Tu progreso se guarda automáticamente
4. **Estadísticas**: Revisa tus estadísticas en cada juego
5. **Diario**: Los juegos se actualizan cada día a las 00:00

## 🔧 Desarrollo

### Agregar un Nuevo Juego

1. **Crear el componente**:
   ```bash
   ng generate component games/nuevo-juego
   ```

2. **Extender BaseGameComponent**:
   ```typescript
   export class NuevoJuegoComponent extends BaseGameComponent {
     // Implementar lógica específica del juego
   }
   ```

3. **Agregar a GameManagerService**:
   ```typescript
   private readonly availableGames: GameState[] = [
     // ... otros juegos
     {
       id: 'nuevo-juego',
       name: 'Nuevo Juego',
       description: 'Descripción del juego',
       route: '/games/nuevo-juego',
       icon: 'fas fa-gamepad'
     }
   ];
   ```

4. **Agregar ruta**:
   ```typescript
   {
     path: 'games/nuevo-juego',
     loadComponent: () => import('./games/nuevo-juego/nuevo-juego.component').then(m => m.NuevoJuegoComponent)
   }
   ```

### Persistencia de Datos

Los datos se almacenan en `localStorage` con la clave `game-dle-data`:

```typescript
{
  "games": [
    {
      "id": "wordle",
      "name": "Wordle",
      "dailyState": {
        "date": "2024-01-15",
        "completed": true,
        "won": true,
        "attempts": 3
      },
      "stats": {
        "totalGames": 10,
        "wins": 8,
        "currentStreak": 3,
        "bestStreak": 5,
        "guessDistribution": [0, 1, 2, 3, 1, 1]
      }
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

## 🎨 Personalización

### Colores y Temas

Los colores se pueden personalizar en `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3B82F6',
          600: '#2563EB'
        }
      }
    }
  }
}
```

### Estilos de Juegos

Cada juego puede tener sus propios estilos extendiendo el componente base:

```typescript
@Component({
  template: `
    <app-base-game [gameId]="'mi-juego'">
      <!-- Contenido personalizado del juego -->
    </app-base-game>
  `,
  styles: [`
    .mi-clase-personalizada {
      /* Estilos específicos */
    }
  `]
})
```

## 🚀 Despliegue

### Build de Producción

```bash
npm run build
```

### Despliegue en GitHub Pages

1. Configurar GitHub Actions
2. Build automático en cada push
3. Despliegue en `https://username.github.io/game-dle`

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

- **Autor**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **Proyecto**: [https://github.com/username/game-dle]

---

¡Disfruta jugando! 🎉
