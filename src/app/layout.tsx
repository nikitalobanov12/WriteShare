import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "~/components/theme/theme-provider";
import { auth } from "@/auth";
import { NotionSidebar } from "~/components/notion-sidebar";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Notion Clone",
  description: "A collaborative Notion clone with real-time edits",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  


  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <TRPCReactProvider>
              {/* Show sidebar layout for authenticated users, except on login page */}
              {session?.user ? (
                <SidebarProvider>
                  <NotionSidebar />
                  <SidebarInset>
                    <main className="flex-1 overflow-auto">
                      {children}
                    </main>
                  </SidebarInset>
                </SidebarProvider>
              ) : (
                /* Show simple layout for unauthenticated users */
                <main className="min-h-screen">
                  {children}
                </main>
              )}
            </TRPCReactProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
