import type {Metadata} from 'next';
import './globals.css';
import { TaskProvider } from '@/components/task-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'DailyTaskTrack | Focus & Productivity',
  description: 'Organize your day with clarity and style. DailyTaskTrack helps you visualize your progress through an interactive calendar and a professional Pomodoro timer.',
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
        <TaskProvider>
          {children}
          <Toaster />
        </TaskProvider>
      </body>
    </html>
  );
}
