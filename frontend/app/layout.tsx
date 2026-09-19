import type { Metadata } from "next";
import AuthGuard from "@/components/AuthGuard";
import ToastContainer from "@/components/ToastContainer";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkFlow — Dashboard",
  description: "Project management dashboard",
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
          {children}
        </AuthGuard>
        <ToastContainer />
      </body>
    </html>
  );
}
