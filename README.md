# Angular Chess Demo

A modern web-based chess application built with Angular 16, featuring both local and online multiplayer capabilities. This project demonstrates the integration of Angular with Firebase for real-time game functionality.

## Features

- 🎮 Local chess gameplay
- 🌐 Online multiplayer support
- 🔥 Real-time game synchronization using Firebase
- 🎨 Modern UI with Angular Material
- 📱 Responsive design
- 🎯 Move validation and game rules enforcement

## Tech Stack

- **Frontend Framework**: Angular 16
- **UI Components**: Angular Material
- **Backend**: Firebase
- **Chess Engine**: ngx-chess-board
- **State Management**: Angular Services
- **Styling**: SCSS

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- npm (v8 or later)
- Angular CLI (v16 or later)
- Firebase CLI (if deploying)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ng-chess-demo.git
cd ng-chess-demo
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project
   - Update the Firebase configuration in `src/environments/environment.ts`

## Development

Run the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200/`

## Building for Production

To build the application for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Testing

Run the test suite:
```bash
npm test
```

## Firebase Setup and Configuration

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project
```bash
firebase init
```
During initialization, select the following options:
- Select "Hosting" as the Firebase feature
- Choose your Firebase project or create a new one
- Use `dist/ng-chess-demo` as your public directory
- Configure as a single-page app: Yes
- Set up automatic builds and deploys with GitHub: No (unless you want to)
- Overwrite index.html: No

### 4. Configure Firebase Environment
1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable the following Firebase services:
   - Authentication
   - Firebase Realtime Database
   - Hosting

3. Update your environment files:
   - Copy `src/environments/environment.sample.ts` to `src/environments/environment.ts`
   - Update the Firebase configuration in `environment.ts` with your project's credentials:
   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: "your-api-key",
       authDomain: "your-project-id.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project-id.appspot.com",
       messagingSenderId: "your-messaging-sender-id",
       appId: "your-app-id"
     }
   };
   ```
   - Repeat the same configuration in `src/environments/environment.prod.ts` for production

### 5. Security Rules Setup
1. Configure Firestore security rules in the Firebase Console:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /games/{gameId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

2. Configure Authentication settings:
   - Enable Email/Password authentication in the Firebase Console
   - Add your domain to the authorized domains list

## Deployment

The application is configured for Firebase hosting. To deploy:

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

## Project Structure

```
src/
├── app/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature modules
│   │   ├── game/       # Local game implementation
│   │   └── online-game/# Online multiplayer implementation
│   ├── models/         # Data models and interfaces
│   ├── services/       # Application services
│   └── app.module.ts   # Root module
├── environments/       # Environment configurations
└── styles.scss        # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ngx-chess-board](https://github.com/loloof64/ngx-chess-board) for the chess board implementation
- [Angular](https://angular.io/) for the framework
- [Firebase](https://firebase.google.com/) for the backend services
