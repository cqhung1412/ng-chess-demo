import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-offline-game',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './offline-game.component.html',
  styleUrls: ['./offline-game.component.scss']
})
export class OfflineGameComponent {
  title = 'Offline Chess Game';
}
