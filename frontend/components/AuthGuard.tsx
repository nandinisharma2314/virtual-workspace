"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlToken = urlParams ? urlParams.get("token") : null;
    if (urlToken) {
      document.cookie = `token=${urlToken}; path=/; max-age=86400; SameSite=Lax`;
      setIsAuthenticated(true);
      return;
    }

    const hasToken = document.cookie.includes("token=");
    const isAuthPage = 
      pathname.startsWith("/login") || 
      pathname.startsWith("/register") || 
      pathname.startsWith("/forgot-password") || 
      pathname.startsWith("/reset-password");

    const isInvite = typeof window !== 'undefined' && (window.location.search.includes('invite=true') || window.location.search.includes('acceptChannel='));

    // If a user opens an invitation link to register or sign in, clear any existing session
    // from another user (e.g. Admin testing locally) so they can create/access their own account
    if (isInvite && (pathname.startsWith("/register") || pathname.startsWith("/login"))) {
      if (hasToken) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      setIsAuthenticated(true);
      return;
    }

    if (!hasToken && !isAuthPage) {
      if (isInvite) {
        router.replace(`/register${window.location.search}`);
      } else {
        router.replace("/login");
      }
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
