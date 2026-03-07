import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DailyTaskTrack | Smart Task Management',
  description: 'Organize your day with intelligence and style. DailyTaskTrack helps you visualize your progress through an interactive calendar and AI task parsing.',
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
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}