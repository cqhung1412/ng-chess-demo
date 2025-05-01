import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material.module';
import { MainPageComponent } from './main-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

describe('MainPageComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainPageComponent,
        RouterTestingModule,
        MaterialModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatToolbarModule,
        MatIconModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title).toBe('Chess Game');
  });

  it('should render title in the template', () => {
    const titleElement = fixture.debugElement.query(By.css('mat-card-title'));
    expect(titleElement).toBeTruthy();
    expect(titleElement.nativeElement.textContent.trim()).toBe('Chess Game');
  });

  it('should have navigation links', () => {
    const links = fixture.debugElement.queryAll(By.css('button[routerLink]'));
    expect(links.length).toBe(2);
  });

  it('should have offline game link', () => {
    const offlineLink = fixture.debugElement.query(By.css('button[routerLink="/offline"]'));
    expect(offlineLink).toBeTruthy();
    expect(offlineLink.nativeElement.textContent.trim()).toContain('Play Offline');
  });

  it('should have online game link', () => {
    const onlineLink = fixture.debugElement.query(By.css('button[routerLink="/online"]'));
    expect(onlineLink).toBeTruthy();
    expect(onlineLink.nativeElement.textContent.trim()).toContain('Play Online');
  });
});
