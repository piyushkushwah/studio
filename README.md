# DailyTaskTrack

A professional command center for productivity, featuring task management, focus tools, and real-time cloud synchronization.

## Hosting & Domain Configuration

If you are hosting this application on a custom domain like **trackdailly.netlify.app**, you must ensure Google Authentication works correctly:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to **Authentication** > **Settings** > **Authorized Domains**.
4. Click **Add Domain** and enter `trackdailly.netlify.app`.

## Cloud Sync

This app uses Firebase Firestore for data persistence. The security rules are configured to allow access to all authenticated users.guest users will have their data persisted in `localStorage`.