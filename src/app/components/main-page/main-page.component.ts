/**
 * @fileoverview Main page component of the Angular Chess Demo.
 * Serves as the landing page and navigation hub for the application.
 */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';

/**
 * @description
 * The main page component that serves as the landing page of the application.
 * 
 * This component:
 * - Is configured as a standalone component
 * - Imports RouterModule for navigation
 * - Imports MaterialModule for UI components
 * - Provides the main navigation interface
 * 
 * @Component decorator configures the component with:
 * - selector: 'app-main-page' for component identification
 * - standalone: true for standalone component configuration
 * - imports: RouterModule and MaterialModule for functionality
 * - templateUrl: Reference to the HTML template
 * - styleUrls: Reference to the SCSS styles
 */
@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterModule, MaterialModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent {
  /** @description The title displayed on the main page */
  title = 'Chess Game';
}
