import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DogBooking - Pet Sitting & Daycare",
  description: "Book trusted pet sitters and daycare services for your dogs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
