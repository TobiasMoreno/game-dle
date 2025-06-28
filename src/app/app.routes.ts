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
    path: 'games/numberle',
    loadComponent: () => import('./games/numberle/numberle.component').then(m => m.NumberleComponent)
  },
  {
    path: 'games/colorle',
    loadComponent: () => import('./games/colorle/colorle.component').then(m => m.ColorleComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
