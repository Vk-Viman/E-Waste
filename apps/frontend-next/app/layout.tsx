import './globals.css';
import React from 'react';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'EcoCollect',
  description: 'Smart waste management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/jsqr@1.4.0/dist/jsQR.js" async></script>
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
