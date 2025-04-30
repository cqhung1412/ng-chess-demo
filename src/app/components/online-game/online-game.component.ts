import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-online-game',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './online-game.component.html',
  styleUrl: './online-game.component.scss'
})
export class OnlineGameComponent {
  title = 'Online Chess Game';
}
