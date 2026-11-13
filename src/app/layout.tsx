import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '1903',
  description: '1903 fashion',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
