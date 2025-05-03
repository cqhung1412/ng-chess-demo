/**
 * @fileoverview Root component of the Angular Chess Demo application.
 * This component serves as the main container for the application's routing.
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * @description
 * The root component of the application that serves as the main container.
 * 
 * This component:
 * - Is configured as a standalone component
 * - Imports RouterOutlet for handling route rendering
 * - Provides the main application template
 * 
 * @Component decorator configures the component with:
 * - selector: 'app-root' for component identification
 * - standalone: true for standalone component configuration
 * - imports: RouterOutlet for routing functionality
 * - template: Simple template with router-outlet for route rendering
 * - styles: Empty array as styles are managed in separate files
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  /** @description The title of the application */
  title = 'Angular Chess Demo';
}
