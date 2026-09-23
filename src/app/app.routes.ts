import { Route, Routes } from '@angular/router';
import publicPages from './public-pages.json';

const loaders: Record<string, NonNullable<Route['loadComponent']>> = {
  '': () => import('./pages/home/home.component').then(m => m.HomeComponent),
  'lol': () => import('./pages/game-universe/game-universe.component').then(m => m.GameUniverseComponent),
  'futbol': () => import('./pages/game-universe/game-universe.component').then(m => m.GameUniverseComponent),
  'acerca-de': () => import('./pages/site-info/site-info.component').then(m => m.SiteInfoComponent),
  'privacidad': () => import('./pages/site-info/site-info.component').then(m => m.SiteInfoComponent),
  'terminos': () => import('./pages/site-info/site-info.component').then(m => m.SiteInfoComponent),
  'contacto': () => import('./pages/site-info/site-info.component').then(m => m.SiteInfoComponent),
  'games/wordle': () => import('./games/wordle/wordle.component').then(m => m.WordleComponent),
  'games/clave-extrema': () => import('./games/clave-extrema/clave-extrema.component').then(m => m.ClaveExtremaComponent),
  'games/futboldle': () => import('./games/futboldle/futboldle.component').then(m => m.FutboldleComponent),
  'games/onepiecedle': () => import('./games/onepiecedle/onepiecedle.component').then(m => m.OnePieceDLEComponent),
  'games/loldle': () => import('./games/loldle/loldle.component').then(m => m.LoldleComponent),
  'games/lol-who': () => import('./games/lol-who/lol-who.component').then(m => m.LolWhoComponent),
  'games/lol-memory': () => import('./games/lol-memory/lol-memory.component').then(m => m.LolMemoryComponent),
  'games/lol-timeline': () => import('./games/lol-timeline/lol-timeline.component').then(m => m.LolTimelineComponent),
  'games/lol-connections': () => import('./games/lol-connections/lol-connections.component').then(m => m.LolConnectionsComponent),
  'games/musicdle': () => import('./games/musicdle/musicdle.component').then(m => m.MusicdleComponent),
  'games/serpentile': () => import('./games/serpentile/serpentile.component').then(m => m.SerpentileComponent),
  'games/enclosure': () => import('./games/enclosure/enclosure.component').then(m => m.EnclosureComponent),
  'games/tuttifrutti': () => import('./games/tuttifrutti/tuttifrutti.component').then(m => m.TuttiFruttiComponent),
  'games/geodle': () => import('./games/geodle/geodle.component').then(m => m.GeodleComponent),
  'games/chronodle': () => import('./games/chronodle/chronodle.component').then(m => m.ChronodleComponent),
  'games/palmodle': () => import('./games/palmodle/palmodle.component').then(m => m.PalmodleComponent),
  'games/rankdle': () => import('./games/rankdle/rankdle.component').then(m => m.RankdleComponent),
  'games/roscodle': () => import('./games/roscodle/roscodle.component').then(m => m.RoscodleComponent),
};

export const routes: Routes = [
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  ...publicPages.map(page => ({
    path: page.path, title: page.title,
    data: { ...page, ...(page.path === 'lol' || page.path === 'futbol' ? { universe: page.path } : {}), ...({'acerca-de': {page: 'about'}, privacidad: {page: 'privacy'}, terminos: {page: 'terms'}, contacto: {page: 'contact'}} as Record<string, object>)[page.path] },
    loadComponent: page.kind === 'existing' ? loaders[page.path] : () => import('./pages/knowledge/knowledge.component').then(m => m.KnowledgeComponent),
  })),
  { path: '**', title: 'Página no encontrada | Game-DLE', data: { noindex: true, description: 'La dirección solicitada no corresponde a una página de Game-DLE.' }, loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
