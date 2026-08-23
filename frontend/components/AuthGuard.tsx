"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const hasToken = document.cookie.includes("token=");
    const isAuthPage = 
      pathname.startsWith("/login") || 
      pathname.startsWith("/register") || 
      pathname.startsWith("/forgot-password") || 
      pathname.startsWith("/reset-password");

    if (!hasToken && !isAuthPage) {
      router.replace("/login");
    } else if (hasToken && isAuthPage) {
      router.replace("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full bg-[#FAFBFC] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6543FF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
