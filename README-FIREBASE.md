# Firebase Integration Setup

This project uses Firebase Firestore to store high scores for the game. Follow these steps to set up Firebase:

## Environment Variables

1. Create or edit the `.env.local` file in the root of your project.
2. Add the following environment variables with your Firebase project credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

## Firestore Database Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Navigate to Firestore Database and create a database if you haven't already.
3. Create a collection named `leaderboard` with the following structure:
   - `name` (string): Player name
   - `score` (number): Player score
   - `timestamp` (timestamp): When the score was recorded

## Security Rules

Add these security rules to your Firestore database:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to leaderboard entries
    match /leaderboard/{entry} {
      allow read: if true;
      // Allow writes with basic validation
      allow create: if 
        // Validate required fields
        request.resource.data.name is string &&
        request.resource.data.name.size() <= 50 &&
        request.resource.data.score is number &&
        request.resource.data.timestamp is timestamp;
    }
    
    // Deny access to all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Usage

Once set up, the high score feature will:
1. Display the highest score at the top of the screen
2. Show an info icon that can be clicked to view the leaderboard
3. Allow players to submit their scores to the global leaderboard

## Troubleshooting

If you encounter any issues with Firebase:
- Make sure your environment variables are set correctly
- Check that your Firebase project has Firestore enabled
- Verify that your security rules are properly configured
- Check the browser console for any Firebase-related errors 