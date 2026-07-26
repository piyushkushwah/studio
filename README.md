
# DailyTaskTrack

A professional command center for productivity, featuring task management, focus tools, and real-time cloud synchronization.

## Setup & Google Authentication

To enable Google Sign-in on your custom domain or development environment:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **studio-3338526474-574c0**.
3. Go to **Authentication** > **Settings** > **Authorized Domains**.
4. Click **Add Domain** and enter:
   - `trackdailly.netlify.app` (for your production site)
   - `6000-firebase-studio-1772896364946.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev` (for your development environment)

## Cloud Sync

This app uses Firebase Firestore for data persistence. The security rules are configured to allow access to all authenticated users.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
