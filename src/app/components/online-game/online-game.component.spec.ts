import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineGameComponent } from './online-game.component';

describe('OnlineGameComponent', () => {
  let component: OnlineGameComponent;
  let fixture: ComponentFixture<OnlineGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlineGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
