import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { NameNecklaceBuilderComponent } from './name-necklace-builder/name-necklace-builder.component';
import { NameBraceletBuilderComponent } from './name-bracelet-builder/name-bracelet-builder.component';
import { DateBraceletBuilderComponent } from './date-bracelet-builder/date-bracelet-builder.component';
import { DateNecklaceBuilderComponent } from './date-necklace-builder/date-necklace-builder.component';

export const routes: Routes = [
    { path: 'home', component: HomePageComponent },
    { path: 'name-bracelet-builder', component: NameBraceletBuilderComponent },
    { path: 'name-necklace-builder', component: NameNecklaceBuilderComponent },
    { path: 'date-necklace-builder', component: DateNecklaceBuilderComponent },
    { path: 'date-bracelet-builder', component: DateBraceletBuilderComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
  ];