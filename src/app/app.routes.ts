import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
      path: 'home', 
      loadComponent: () => import('./home-page/home-page.component').then(m => m.HomePageComponent),
    },
    { 
      path: 'name-bracelet-builder',
      loadComponent: () => import('./name-bracelet-builder/name-bracelet-builder.component').then(m => m.NameBraceletBuilderComponent),
    },
    { 
      path: 'name-necklace-builder',
      loadComponent: () => import('./name-necklace-builder/name-necklace-builder.component').then(m => m.NameNecklaceBuilderComponent),
    },
    { 
      path: 'date-necklace-builder',
      loadComponent: () => import('./date-necklace-builder/date-necklace-builder.component').then(m => m.DateNecklaceBuilderComponent),
    },
    { 
      path: 'date-bracelet-builder',
      loadComponent: () => import('./date-bracelet-builder/date-bracelet-builder.component').then(m => m.DateBraceletBuilderComponent),
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
  ];