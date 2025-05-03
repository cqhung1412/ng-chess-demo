/**
 * @fileoverview Application routing configuration for the Angular Chess Demo.
 * Defines the routes and their corresponding components for the application.
 */

import { Routes } from '@angular/router';
import { MainPageComponent } from './components/main-page/main-page.component';
import { OfflineGameComponent } from './components/offline-game/offline-game.component';
import { OnlineGameComponent } from './components/online-game/online-game.component';
import { IframePageComponent } from './components/iframepage/iframepage.component';

/**
 * @description
 * The main routing configuration for the application.
 * 
 * Routes defined:
 * - '' (root) -> Redirects to '/mainpage'
 * - '/mainpage' -> MainPageComponent (Home page)
 * - '/offline' -> OfflineGameComponent (Local chess game)
 * - '/online' -> OnlineGameComponent (Online multiplayer game)
 * - '/iframepage' -> IframePageComponent (Embedded game view)
 * 
 * @type {Routes}
 */
export const routes: Routes = [
  { path: '', redirectTo: '/mainpage', pathMatch: 'full' },
  { path: 'mainpage', component: MainPageComponent },
  { path: 'offline', component: OfflineGameComponent },
  { path: 'online', component: OnlineGameComponent },
  { path: 'iframepage', component: IframePageComponent }
];
