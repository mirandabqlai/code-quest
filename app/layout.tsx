import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Code Quest — Turn Any Codebase Into a Game',
  description: 'Paste a GitHub repo URL. Get a retro pixel-art arcade game that teaches how the code works.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
