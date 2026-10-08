import type { Metadata } from "next";
import "./globals.css";
import AdminSidebar from "@/components/AdminSidebar";
import ToastContainer from "@/components/ToastContainer";
import AdminAuthGuard from "@/components/AdminAuthGuard";

export const metadata: Metadata = {
  title: "Workspace Admin Console",
  description: "Operations dashboard for managing workspace themes, templates, and users",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden bg-[#FAFBFC] text-gray-900 antialiased">
        <AdminAuthGuard>
          <div className="flex h-screen w-screen overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
              {children}
            </main>
          </div>
        </AdminAuthGuard>
        <ToastContainer />
      </body>
    </html>
  );
}
