import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'CapitalFargoFX',
  description: 'Digital asset management and investment platform.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body  cz-shortcut-listen="true">{children}</body>
    </html>
  );
}