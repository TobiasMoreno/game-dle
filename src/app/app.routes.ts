import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    title: 'Game-DLE | Elegí tu próximo desafío',
    data: { description: 'Desafíos diarios, rondas ilimitadas y juegos multijugador en un solo lugar.' },
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'acerca-de',
    title: 'Acerca de Game-DLE | Juegos creados en Argentina',
    data: { page: 'about', description: 'Conocé quién crea Game-DLE, cómo se desarrollan sus juegos y qué buscamos aportar con cada desafío.' },
    loadComponent: () => import('./pages/site-info/site-info.component').then(m => m.SiteInfoComponent)
  },
  {
    path: 'privacidad',
    title: 'Política de privacidad | Game-DLE',
    data: { page: 'privacy', description: 'Información sobre almacenamiento local, Firebase, YouTube, publicidad, cookies y opciones de privacidad en Game-DLE.' },
    loadComponent: () => import('./pages/site-info/site-info.component').then(m => m.SiteInfoComponent)
  },
  {
    path: 'terminos',
    title: 'Términos de uso | Game-DLE',
    data: { page: 'terms', description: 'Condiciones de uso, propiedad intelectual, disponibilidad y responsabilidades aplicables a Game-DLE.' },
    loadComponent: () => import('./pages/site-info/site-info.component').then(m => m.SiteInfoComponent)
  },
  {
    path: 'contacto',
    title: 'Contacto | Game-DLE',
    data: { page: 'contact', description: 'Contactá al responsable de Game-DLE para informar errores, sugerencias, privacidad o derechos de autor.' },
    loadComponent: () => import('./pages/site-info/site-info.component').then(m => m.SiteInfoComponent)
  },
  {
    path: 'games/wordle',
    title: 'Wordle | Game-DLE',
    data: { description: 'Adiviná la palabra diaria en seis intentos.' },
    loadComponent: () => import('./games/wordle/wordle.component').then(m => m.WordleComponent)
  },
  {
    path: 'games/futboldle',
    title: 'FutbolDLE | Game-DLE',
    data: { description: 'Descubrí el apellido oculto del futbolista en rondas ilimitadas.' },
    loadComponent: () => import('./games/futboldle/futboldle.component').then(m => m.FutboldleComponent)
  },
  {
    path: 'games/onepiecedle',
    title: 'One Piece DLE | Game-DLE',
    data: { description: 'Adiviná el personaje diario de One Piece.' },
    loadComponent: () => import('./games/onepiecedle/onepiecedle.component').then(m => m.OnePieceDLEComponent)
  },
  {
    path: 'games/loldle',
    title: 'LoL DLE | Game-DLE',
    data: { description: 'Adiviná el campeón diario de League of Legends.' },
    loadComponent: () => import('./games/loldle/loldle.component').then(m => m.LoldleComponent)
  },
  {
    path: 'games/musicdle',
    title: 'MusicDLE | Game-DLE',
    data: { description: 'Reconocé canciones escuchando fragmentos breves.' },
    loadComponent: () => import('./games/musicdle/musicdle.component').then(m => m.MusicdleComponent)
  },
  {
    path: 'games/serpentile',
    title: 'Serpentile | Game-DLE',
    data: { description: 'Guiá a la serpiente girando las piezas del tablero diario.' },
    loadComponent: () => import('./games/serpentile/serpentile.component').then(m => m.SerpentileComponent)
  },
  {
    path: 'games/tuttifrutti',
    title: 'Tutti Frutti | Game-DLE',
    data: { description: 'Creá una sala y competí en vivo con tus amigos.' },
    loadComponent: () => import('./games/tuttifrutti/tuttifrutti.component').then(m => m.TuttiFruttiComponent)
  },
  {
    path: 'games/geodle',
    title: 'GeoDLE | Game-DLE',
    data: { description: 'Encontrá el país oculto mediante pistas geográficas.' },
    loadComponent: () => import('./games/geodle/geodle.component').then(m => m.GeodleComponent)
  },
  {
    path: 'games/chronodle',
    title: 'ChronoDLE | Game-DLE',
    data: { description: 'Ordená acontecimientos históricos en rondas ilimitadas.' },
    loadComponent: () => import('./games/chronodle/chronodle.component').then(m => m.ChronodleComponent)
  },
  {
    path: 'games/palmodle',
    title: 'Palmó Primero | Game-DLE',
    data: { description: 'Elegí cuál de dos figuras famosas murió primero y defendé tus tres vidas.' },
    loadComponent: () => import('./games/palmodle/palmodle.component').then(m => m.PalmodleComponent)
  },
  {
    path: 'games/rankdle',
    title: 'RankDLE | Game-DLE',
    data: { description: 'Clasificá elementos según el desafío de cada ronda.' },
    loadComponent: () => import('./games/rankdle/rankdle.component').then(m => m.RankdleComponent)
  },
  {
    path: 'games/roscodle',
    title: 'RoscoDLE | Game-DLE',
    data: { description: 'Completá el abecedario futbolero antes de que termine el tiempo.' },
    loadComponent: () => import('./games/roscodle/roscodle.component').then(m => m.RoscodleComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
