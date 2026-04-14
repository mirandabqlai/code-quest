import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

// Load the pixel font via Next.js font system — this ensures the font is
// available before first paint (no flash of unstyled text). The `variable`
// option creates a CSS custom property we can reference anywhere.
const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Code Quest — Turn Any Codebase Into a Game',
  description: 'Paste a GitHub repo URL. Get a retro pixel-art arcade game that teaches how the code works.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={pixelFont.variable}>
      <body>
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
