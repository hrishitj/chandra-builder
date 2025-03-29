import { Routes } from '@angular/router';
import { NameNecklaceBuilderComponent } from './name-necklace-builder/name-necklace-builder.component';
import { NameBraceletBuilderComponent } from './name-bracelet-builder/name-bracelet-builder.component';
import { CustomNecklaceBuilderComponent } from './custom-necklace-builder/custom-necklace-builder.component';
import { HomePageComponent } from './home-page/home-page.component';
import { DateBraceletBuilderComponent } from './date-bracelet-builder/date-bracelet-builder.component';

export const routes: Routes = [
    { path: 'home', component: HomePageComponent },
    { path: 'name-bracelet-builder', component: NameBraceletBuilderComponent },
    { path: 'name-necklace-builder', component: NameNecklaceBuilderComponent },
    { path: 'custom-necklace-builder', component: CustomNecklaceBuilderComponent },
    { path: 'date-bracelet-builder', component: DateBraceletBuilderComponent },
    
  ];