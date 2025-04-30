import { Routes } from '@angular/router';
import { MainPageComponent } from './components/main-page/main-page.component';
import { OfflineGameComponent } from './components/offline-game/offline-game.component';
import { OnlineGameComponent } from './components/online-game/online-game.component';

export const routes: Routes = [
  { path: '', redirectTo: '/mainpage', pathMatch: 'full' },
  { path: 'mainpage', component: MainPageComponent },
  { path: 'offline', component: OfflineGameComponent },
  { path: 'online/:gameCode', component: OnlineGameComponent }
];
