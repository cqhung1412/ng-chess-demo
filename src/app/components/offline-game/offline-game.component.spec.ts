import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material.module';
import { OfflineGameComponent } from './offline-game.component';
import { GameStateService } from '../../services/game-state.service';
import { ChessMessageService } from '../../services/chess-message.service';
import { ChessMoveMessage, ChessGameEndMessage } from '../../models/chess-message.model';
import { NgZone } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('OfflineGameComponent', () => {
  let component: OfflineGameComponent;
  let fixture: ComponentFixture<OfflineGameComponent>;
  let gameStateService: jasmine.SpyObj<GameStateService>;
  let ngZone: NgZone;

  const mockGameState = {
    moveCount: 0,
    isWhiteTurn: true,
    lastProcessedMove: null,
    moveHistory: []
  };

  beforeEach(async () => {
    const gameStateServiceSpy = jasmine.createSpyObj('GameStateService', [
      'loadGameState',
      'saveGameState',
      'clearGameState'
    ]);

    // Mock the static methods of ChessMessageService
    spyOn(ChessMessageService, 'isChessMoveMessage').and.callFake((event: MessageEvent): event is MessageEvent<ChessMoveMessage> => {
      return event.data?.type === 'move';
    });

    spyOn(ChessMessageService, 'isChessGameEndMessage').and.callFake((event: MessageEvent): event is MessageEvent<ChessGameEndMessage> => {
      return event.data?.type === 'gameEnd';
    });

    spyOn(ChessMessageService, 'sendMove').and.callFake((target: Window, move: string) => {
      // Simulate the move being sent to the target window
      target.postMessage({ type: 'move', move }, '*');
    });

    gameStateServiceSpy.loadGameState.and.returnValue(mockGameState);
    gameStateServiceSpy.saveGameState.and.returnValue(Promise.resolve());
    gameStateServiceSpy.clearGameState.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [
        OfflineGameComponent,
        RouterTestingModule,
        MaterialModule,
        NoopAnimationsModule,
        NgxChessBoardModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatToolbarModule
      ],
      providers: [
        { provide: GameStateService, useValue: gameStateServiceSpy },
        {
          provide: NgZone,
          useValue: new NgZone({ enableLongStackTrace: false })
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflineGameComponent);
    component = fixture.componentInstance;
    gameStateService = TestBed.inject(GameStateService) as jasmine.SpyObj<GameStateService>;
    ngZone = TestBed.inject(NgZone);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title).toBe('Offline Chess Game');
  });

  it('should initialize with default values', () => {
    expect(component.moveCount).toBe(0);
    expect(component.isWhiteTurn).toBeTrue();
    expect(component.gameEnded).toBeFalse();
    expect(component.gameEndMessage).toBe('');
  });

  it('should load saved game state', () => {
    expect(gameStateService.loadGameState).toHaveBeenCalled();
    expect(component.moveCount).toBe(mockGameState.moveCount);
    expect(component.isWhiteTurn).toBe(mockGameState.isWhiteTurn);
  });

  it('should handle continue game choice', () => {
    const event = new CustomEvent('continueGameChoice', { detail: true });
    window.dispatchEvent(event);
    
    expect(gameStateService.loadGameState).toHaveBeenCalled();
    expect(component.moveCount).toBe(mockGameState.moveCount);
    expect(component.isWhiteTurn).toBe(mockGameState.isWhiteTurn);
  });

  it('should handle new game choice', () => {
    const event = new CustomEvent('continueGameChoice', { detail: false });
    window.dispatchEvent(event);
    
    expect(gameStateService.clearGameState).toHaveBeenCalled();
    expect(component.moveCount).toBe(0);
    expect(component.isWhiteTurn).toBeTrue();
  });

  it('should save game state after move', async () => {
    // Create mock iframes
    const mockIframe1 = {
      contentWindow: window,
      contentDocument: document
    } as unknown as HTMLIFrameElement;

    const mockIframe2 = {
      contentWindow: window,
      contentDocument: document
    } as unknown as HTMLIFrameElement;
    
    component.iframes = {
      toArray: () => [
        { nativeElement: mockIframe1 },
        { nativeElement: mockIframe2 }
      ]
    } as any;

    // Set up the component state
    component.moveCount = 0;
    component.isWhiteTurn = true;
    component.gameEnded = false;
    component.gameEndMessage = '';

    // Initialize the component's view
    component.ngAfterViewInit();

    // Create and dispatch the move event
    const event = new MessageEvent('message', {
      data: { type: 'move', move: 'e2e4' },
      origin: window.origin,
      source: window
    });

    // Run the event in the NgZone
    await ngZone.run(() => {
      window.dispatchEvent(event);
    });

    // Wait for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the game state was saved
    expect(gameStateService.saveGameState).toHaveBeenCalledWith({
      moveCount: 1,
      isWhiteTurn: false,
      lastProcessedMove: 'e2e4',
      moveHistory: ['e2e4']
    });
  });

  it('should handle game end message', async () => {
    // Create a mock iframe
    const mockIframe = {
      contentWindow: window,
      contentDocument: document
    } as unknown as HTMLIFrameElement;
    
    component.iframes = {
      toArray: () => [{
        nativeElement: mockIframe
      }]
    } as any;

    // Set up the component state
    component.gameEnded = false;
    component.gameEndMessage = '';

    // Initialize the component's view
    component.ngAfterViewInit();

    // Create and dispatch the game end event
    const event = new MessageEvent('message', {
      data: { 
        type: 'gameEnd',
        message: 'Checkmate!'
      },
      origin: window.origin,
      source: window
    });

    // Run the event in the NgZone
    await ngZone.run(() => {
      window.dispatchEvent(event);
    });

    // Wait for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the game state was updated
    expect(component.gameEnded).toBeTrue();
    expect(component.gameEndMessage).toBe('Checkmate!');
  });

  it('should reset game state', () => {
    component.gameEnded = true;
    component.gameEndMessage = 'Checkmate!';
    component.moveCount = 5;
    component.isWhiteTurn = false;
    
    component.resetGame();
    
    expect(component.gameEnded).toBeFalse();
    expect(component.gameEndMessage).toBe('');
    expect(component.moveCount).toBe(0);
    expect(component.isWhiteTurn).toBeTrue();
  });
});
