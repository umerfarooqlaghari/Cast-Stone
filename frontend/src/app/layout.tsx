import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cast Stone Interiors & Decorations - Timeless Elegance",
  description: "Discover our exquisite collection of handcrafted cast stone interiors, fireplaces, and decorative elements that transform spaces into works of art.",
  keywords: "cast stone, architectural elements, fireplaces, decorative pieces, interior design, handcrafted stone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--cart-bg)',
              color: 'var(--cart-text-primary)',
              border: '1px solid var(--cart-border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px var(--cart-shadow)',
            },
            success: {
              iconTheme: {
                primary: 'var(--cart-success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--cart-error)',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
