import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/providers/AuthProvider";
import { BannedUserGuard } from "@/components/common/BannedUserGuard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrewSpot",
  description: "Discover the best coffee spots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-background text-neutral flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <BannedUserGuard>
            <Header />
            <main className="min-h-screen bg-base-100 pb-20">
              {children}
            </main>
          </BannedUserGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
