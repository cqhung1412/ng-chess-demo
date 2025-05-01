/**
 * @fileoverview Root module of the Angular Chess Demo application.
 * This module bootstraps the application and sets up core dependencies.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { OnlineGameService } from './services/online-game.service';

/**
 * @description
 * The root module of the application that bootstraps the AppComponent.
 * 
 * This module:
 * - Imports essential Angular modules
 * - Provides the OnlineGameService for dependency injection
 * - Bootstraps the main AppComponent
 * 
 * @NgModule decorator configures the module with:
 * - imports: CommonModule and BrowserAnimationsModule for basic Angular functionality
 * - providers: OnlineGameService for managing online game state
 * - bootstrap: AppComponent as the root component
 */
@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule
  ],
  providers: [
    OnlineGameService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 