import type { Metadata } from "next";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { CustomerFooter } from "@/components/home/customer-footer";
import { CustomerHeader } from "@/components/home/customer-header";
import { SignedOutToast } from "@/components/ui/signed-out-toast";
import { ToastProvider } from "@/components/ui/toast-provider";
import { getHomeData } from "@/lib/home/service";
import "./globals.css";

async function FooterWithCinemaData() {
  await connection();
  const result = await getHomeData();
  return <CustomerFooter cinemas={result.ok ? result.data.cinemas : []} />;
}

async function HeaderWithAuthState() {
  await connection();
  const isAuthenticated = (await cookies()).has("maqady_access_token");
  return <CustomerHeader isAuthenticated={isAuthenticated} />;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maqady Cinema",
  applicationName: "Maqady",
  description:
    "Discover movies, explore cinemas, and reserve your seats with Maqady.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
          <Suspense fallback={<CustomerHeader isAuthenticated={false} />}>
            <HeaderWithAuthState />
          </Suspense>
          <SignedOutToast />
          <div className="flex flex-1 flex-col">{children}</div>
          <Suspense fallback={<CustomerFooter cinemas={[]} />}>
            <FooterWithCinemaData />
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
