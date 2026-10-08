"use client";

import { useEffect } from "react";

export default function AdminRedirect() {
  useEffect(() => {
    window.location.href = "http://localhost:3002";
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800">Redirecting to Admin Console...</h2>
        <p className="text-sm text-gray-500 mt-1">Please wait</p>
      </div>
    </div>
  );
}
