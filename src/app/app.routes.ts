import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'games/wordle',
    loadComponent: () => import('./games/wordle/wordle.component').then(m => m.WordleComponent)
  },
  {
    path: 'games/onepiecedle',
    loadComponent: () => import('./games/onepiecedle/onepiecedle.component').then(m => m.OnePieceDLEComponent)
  },
  {
    path: 'games/loldle',
    loadComponent: () => import('./games/loldle/loldle.component').then(m => m.LoldleComponent)
  },
  {
    path: 'games/musicdle',
    loadComponent: () => import('./games/musicdle/musicdle.component').then(m => m.MusicdleComponent)
  },
  {
    path: 'games/serpentile',
    loadComponent: () => import('./games/serpentile/serpentile.component').then(m => m.SerpentileComponent)
  },
  {
    path: 'games/tuttifrutti',
    loadComponent: () => import('./games/tuttifrutti/tuttifrutti.component').then(m => m.TuttiFruttiComponent)
  },
  {
    path: 'games/geodle',
    loadComponent: () => import('./games/geodle/geodle.component').then(m => m.GeodleComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
