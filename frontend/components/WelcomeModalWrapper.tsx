"use client";

import React, { useState, useEffect } from "react";
import WelcomeModal from "./WelcomeModal";

interface WelcomeModalWrapperProps {
  userName: string;
}

export default function WelcomeModalWrapper({ userName }: WelcomeModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // For demonstration, open the modal shortly after mount
    // In a real app, this might check localStorage to only show once
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <WelcomeModal 
      userName={userName} 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
    />
  );
}
