import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import DevNotice from "@/components/DevNotice";
import SplashScreen from "@/components/SplashScreen";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: "SMILE — Student Mental Health Intelligent Learning Evaluator",
  description: "AI-powered student mental health risk prediction and wellness monitoring platform",
  keywords: "mental health, student wellness, AI prediction, SMILE, depression risk",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${jakarta.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <SplashScreen />
            <DevNotice />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
