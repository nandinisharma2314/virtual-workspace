"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function MeetingJoinRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = params?.id;
    if (id) {
      router.replace(`/meetings?join=${id}`);
    } else {
      router.replace("/meetings");
    }
  }, [params, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-sm font-semibold text-gray-600">Connecting to meeting room...</p>
      </div>
    </div>
  );
}
