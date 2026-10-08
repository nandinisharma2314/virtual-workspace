import type { Metadata } from "next";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import { WorkspaceProvider } from "@/lib/WorkspaceContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "nannex — Chat / Meet / Connect",
  description: "nannex — The unified collaboration platform to chat, meet, and connect.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-screen overflow-hidden antialiased">
      <body className="h-screen w-screen overflow-hidden flex flex-col bg-[#FAFBFC] text-[#111827] font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <AuthGuard>
          <WorkspaceProvider>
            {children}
          </WorkspaceProvider>
        </AuthGuard>
        <ToastContainer />
      </body>
    </html>
  );
}

