"use client";

import { avatarColors } from "@/lib/data";
import { useEffect, useState } from "react";

export default function Avatar({
  person,
  name,
  avatar,
  size = 32,
  ring = false,
}: {
  person?: string;
  name?: string;
  avatar?: string | null;
  size?: number;
  ring?: boolean;
}) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!avatar) {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (token) {
          const user = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser(user);
        }
      } catch (e) {}
    }
  }, [avatar]);

  let displayAvatar = avatar;

  if (!displayAvatar && currentUser) {
    const nameMatches = name && currentUser.name && name.toLowerCase() === currentUser.name.toLowerCase();
    const personMatches = person && currentUser.sub && person === currentUser.sub;
    
    if ((nameMatches || personMatches) && currentUser.avatar) {
      displayAvatar = currentUser.avatar;
    }
  }

  // Always use a generated avatar if none is provided to replace text initials
  if (!displayAvatar) {
    const seed = encodeURIComponent(person || name || "default");
    displayAvatar = `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=f3f4f6`;
  }

  return (
    <div 
      className={`shrink-0 overflow-hidden rounded-full ${ring ? "ring-2 ring-white" : ""} bg-gray-100 flex items-center justify-center`}
      style={{ width: size, height: size }}
      title={name || person || "Avatar"}
    >
      <img 
        src={displayAvatar} 
        alt={name || person || "Avatar"} 
        className="w-full h-full object-cover" 
      />
    </div>
  );
}
