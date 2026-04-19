import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "PokerTrainer MTT - GTO Study Tool",
  description:
    "Master MTT poker with push/fold charts, range training, hand replayer, and ICM calculator. GTO-based study tool for tournament players.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-poker-bg text-white">
        <Navbar />
        <main className="pt-14 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
