import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from '../../material.module';
import { OnlineGameComponent } from './online-game.component';
import { OnlineGameService } from '../../services/online-game.service';
import { GameState, GameMove } from '../../models/online-game.model';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChessBoardModule } from 'ngx-chess-board';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of } from 'rxjs';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';

describe('OnlineGameComponent', () => {
  let component: OnlineGameComponent;
  let fixture: ComponentFixture<OnlineGameComponent>;
  let onlineGameService: jasmine.SpyObj<OnlineGameService>;
  let activatedRoute: ActivatedRoute;

  const mockGameState: GameState = {
    game: {
      id: 'test-game',
      board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentPlayer: 'white',
      status: 'playing',
      whitePlayer: 'Player1',
      blackPlayer: 'Player2',
      createdAt: Date.now(),
      lastMoveAt: Date.now(),
      gameCode: 'TEST123',
      expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour from now
    },
    players: {
      white: {
        id: 'player1',
        name: 'Player1',
        color: 'white',
        isReady: true
      },
      black: {
        id: 'player2',
        name: 'Player2',
        color: 'black',
        isReady: true
      }
    },
    moves: []
  };

  beforeEach(async () => {
    const onlineGameServiceSpy = jasmine.createSpyObj('OnlineGameService', [
      'createGame',
      'joinGame',
      'listenToGame',
      'makeMove',
      'cleanup'
    ]);

    onlineGameServiceSpy.makeMove.and.returnValue(Promise.resolve(true));
    onlineGameServiceSpy.createGame.and.returnValue(Promise.resolve('NEWGAME'));
    onlineGameServiceSpy.joinGame.and.returnValue(Promise.resolve(true));
    onlineGameServiceSpy.listenToGame.and.returnValue(of(mockGameState));

    await TestBed.configureTestingModule({
      imports: [
        OnlineGameComponent,
        RouterTestingModule,
        MaterialModule,
        NoopAnimationsModule,
        NgxChessBoardModule,
        MatButtonModule,
        MatCardModule,
        MatInputModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore())
      ],
      providers: [
        { provide: OnlineGameService, useValue: onlineGameServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ gameCode: 'TEST123' })
          }
        },
        {
          provide: FIREBASE_OPTIONS,
          useValue: environment.firebase
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineGameComponent);
    component = fixture.componentInstance;
    onlineGameService = TestBed.inject(OnlineGameService) as jasmine.SpyObj<OnlineGameService>;
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title).toBe('Online Chess Game');
  });

  it('should initialize with default values', () => {
    expect(component.currentGameState).toBeNull();
    expect(component.isWhitePlayer).toBeFalse();
    expect(component.gameCode).toBe('TEST123');
    expect(component.isCreatingGame).toBeFalse();
  });

  it('should create a new game', async () => {
    const playerName = 'TestPlayer';
    const gameCode = 'NEWGAME';
    
    await component.createNewGame(playerName);
    
    expect(onlineGameService.createGame).toHaveBeenCalledWith(playerName);
    expect(component.gameCode).toBe(gameCode);
    expect(component.isWhitePlayer).toBeTrue();
    expect(component.isCreatingGame).toBeFalse();
  });

  it('should join an existing game', async () => {
    const gameCode = 'TEST123';
    const playerName = 'TestPlayer';
    
    await component.joinGame(gameCode, playerName);
    
    expect(onlineGameService.joinGame).toHaveBeenCalledWith(gameCode, playerName);
    expect(component.isWhitePlayer).toBeFalse();
  });

  it('should handle move validation', async () => {
    // Set up the component state
    component.currentGameState = {
      ...mockGameState,
      game: {
        ...mockGameState.game,
        currentPlayer: 'white'
      }
    };
    component.isWhitePlayer = true;
    component.gameCode = 'TEST123';
    
    // Create a mock board with getFEN method
    const mockBoard = {
      getFEN: () => 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
    };
    component.board = mockBoard as any;
    
    // Create a valid move
    const validMove = {
      from: 'e2',
      to: 'e4',
      piece: 'P',
      color: 'white',
      timestamp: Date.now()
    };
    
    // Make the move
    await component.onMove(validMove);
    
    // Verify the move was made
    expect(onlineGameService.makeMove).toHaveBeenCalledWith(
      'TEST123',
      jasmine.objectContaining({
        from: 'e2',
        to: 'e4',
        piece: 'P',
        color: 'white'
      }),
      jasmine.any(String)
    );
  });

  it('should handle waiting for opponent', () => {
    component.currentGameState = {
      ...mockGameState,
      players: {
        ...mockGameState.players,
        black: null
      }
    };
    
    expect(component.waitingForOpponent).toBeTrue();
  });

  it('should handle waiting for opponent move', () => {
    component.currentGameState = mockGameState;
    component.isWhitePlayer = true;
    
    expect(component.waitingForOpponentMove).toBeFalse();
    
    component.currentGameState.game.currentPlayer = 'black';
    expect(component.waitingForOpponentMove).toBeTrue();
  });

  it('should cleanup on destroy', () => {
    component.ngOnDestroy();
    expect(onlineGameService.cleanup).toHaveBeenCalled();
  });
});
