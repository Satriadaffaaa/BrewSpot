import type { Metadata } from "next";
import { Inter, Poppins, Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/providers/AuthProvider";
import { BannedUserGuard } from "@/components/common/BannedUserGuard";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
  title: "Lokali | Spot Lokal, Cerita Nyata",
  description: "Temukan UMKM pilihan, hidden gems terbaik, dan komunitas yang mencintai keaslian setiap tempat di sekitarmu. Dukung bisnis lokal, jelajahi cerita nyata.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, inter.variable, poppins.variable)} suppressHydrationWarning>
      <body
        className="antialiased bg-background text-neutral flex flex-col min-h-screen"
      >
        <AuthProvider>
          <BannedUserGuard>
            <Header />
            <main className="flex-grow bg-background">
              {children}
            </main>
            <Footer />
          </BannedUserGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
