import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import Image from 'next/image';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite?: (email: string) => void;
}

export default function InviteModal({ isOpen, onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isValidEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const handleInvite = async () => {
    if (isValidEmail(email) && !isLoading) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/mail/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            inviterName: 'A teammate',
            channelName: 'WorkFlow'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send invite');
        }

        if (onInvite) onInvite(email);
        onClose();
        setEmail("");
      } catch (error) {
        console.error('Error sending invitation:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-[1.25rem] shadow-2xl w-full max-w-[540px] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* Top Illustration Area */}
        <div className="h-[220px] bg-[#FDF5EC] relative flex items-center justify-center w-full border-b border-gray-100">
          <div className="relative w-full h-full max-w-[280px]">
             <Image 
               src="/invite_illustration.png" 
               alt="Invite external partners" 
               fill
               className="object-contain"
               priority
             />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 pb-6 flex-1 flex flex-col">
          <h2 className="text-[22px] font-black text-gray-900 mb-3 tracking-tight">Message with external people</h2>
          <p className="text-[14.5px] text-gray-700 leading-relaxed font-medium mb-6">
            WorkFlow Connect lets you securely send direct messages to external people from other organizations. Send an invitation via email, and we'll notify you as soon as they accept.
          </p>

          <div className="mb-2">
            <input 
              type="email"
              placeholder="Add an email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-[14.5px] text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium placeholder-gray-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2 flex items-center justify-between mt-auto">
          <button className="flex items-center gap-2 text-[13.5px] font-bold text-gray-500 hover:text-gray-800 transition-colors">
            <HelpCircle size={16} />
            <span>Learn more about WorkFlow Connect</span>
          </button>

          <button 
            onClick={handleInvite}
            disabled={!isValidEmail(email) || isLoading}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-[14px] transition-all ${
              isValidEmail(email) && !isLoading
                ? "bg-[#1164A3] text-white shadow-sm hover:bg-[#0B4D7E] active:scale-[0.98]" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
