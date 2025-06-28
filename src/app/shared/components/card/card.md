# Card Component

## Descripción

El `CardComponent` es un componente reutilizable diseñado para mostrar información de una vacante. Requiere que se le pase un objeto del tipo `VacancyCard` como input obligatorio. Incluye soporte opcional para header (logo de la empresa, acciones del header), acciones personalizadas y un estilo hover.

## Instalación

El componente está disponible como parte del sistema de diseño. No requiere instalación adicional.

## API

### Inputs

| Input           | Tipo           | Requerido | Descripción                                                                 |
|----------------|----------------|-----------|-----------------------------------------------------------------------------|
| `vacancy`      | `VacancyCard`  | ✅ Sí     | Objeto obligatorio con la información de la vacante.                       |
| `header`       | `boolean`      | No        | Muestra el encabezado del card. Por defecto: `false`.                      |
| `accionsheader`| `boolean`      | No        | Muestra los tres puntos (ícono de opciones) en el header.                  |
| `actions`      | `boolean`      | No        | Habilita una sección para acciones personalizadas.                         |
| `hoverable`    | `boolean`      | No        | Aplica efecto hover al pasar el mouse. Por defecto: `true`.                |

## Uso

### Importación

```typescript
import { CardComponent } from '@/shared/components/card/card.component';
```

### Ejemplos Básicos

#### Variantes



```html
<!-- Card simple sin header ni acciones -->
<app-card 
  [vacancy]="vacante">
</app-card>
<!-- Card con acciones del header y logo -->
<app-card 
  [vacancy]="vacante"
  [header]="true">
</app-card>
<!-- Card completa con header, logo, acciones y opciones -->
<app-card 
  [vacancy]="vacante"
  [header]="true"
  [accionsheader]="true"
  [actions]="true"
  [hoverable]="true"
>
  <div card-actions>
    <button class="btn-primary">Postularse</button>
    <button class="btn-secondary">Guardar</button>
  </div>
</app-card>
```

## Ejemplo de interfaz `VacancyCard` 

```typescript
  testVacancy:VacancyCard= {
    // Obligatorio
    rol: 'Desarrollador Angular',

    // Opcional
    logoCompany:'/assets/img/logo-microsoft.png',

    // Obligatorio
    location: 'Zona sur, Peralta Ramos Oeste, Mar Del plata, Buenos Aires, Argentina',

    // Obligatorio
    creationDate: '2025-02-21 14:30:00',

     // Obligatorio
    nameCompany:"Microsoft"
  };
```
