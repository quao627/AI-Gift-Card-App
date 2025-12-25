import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Gift Card Generator',
  description: 'Create beautiful Christmas gift cards with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

