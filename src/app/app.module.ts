import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { OnlineGameService } from './services/online-game.service';

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