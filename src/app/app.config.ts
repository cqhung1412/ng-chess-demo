/**
 * @fileoverview Application configuration for the Angular Chess Demo.
 * Sets up core application providers and configurations.
 */

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

/**
 * @description
 * The main application configuration object.
 * 
 * This configuration:
 * - Provides the router with application routes
 * - Enables animations
 * - Configures HTTP client
 * - Sets default options for Material snackbar notifications
 * 
 * @type {ApplicationConfig}
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 } }
  ]
};
