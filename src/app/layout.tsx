import type {Metadata} from 'next';
import './globals.css';
import { TaskProvider } from '@/components/task-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AppHeader } from '@/components/app-header';
import { AppTour } from '@/components/app-tour';
import { FloatButtonGroup } from '@/components/float-button-group';

export const metadata: Metadata = {
  title: 'DailyTaskTrack | Focus & Productivity',
  description: 'Organize your day with clarity and style. DailyTaskTrack helps you visualize your progress through an interactive calendar and a professional Pomodoro timer.',
  icons: {
    icon: 'data:,',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <TaskProvider>
            <div className="min-h-screen flex flex-col">
              <AppHeader />
              <main className="w-full flex-1 flex flex-col">
                {children}
              </main>
              <AppTour />
              <FloatButtonGroup />
            </div>
            <Toaster />
          </TaskProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
