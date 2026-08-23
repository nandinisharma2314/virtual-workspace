"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Member = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
};

const initialMembers: Member[] = [
  { id: "avi", name: "Avi Singh", role: "Frontend Developer", department: "Engineering", status: "Active" },
  { id: "rohit", name: "Rohit Verma", role: "Backend Developer", department: "Engineering", status: "Active" },
  { id: "priya", name: "Priya Singh", role: "UI/UX Designer", department: "Design", status: "Active" },
  { id: "neha", name: "Neha Sharma", role: "Product Manager", department: "Product", status: "Away" },
  { id: "arjun", name: "Arjun Patel", role: "QA Engineer", department: "Engineering", status: "Active" },
  { id: "rahul", name: "Rahul Sharma", role: "Marketing Lead", department: "Marketing", status: "Offline" },
  { id: "vikram", name: "Vikram Joshi", role: "DevOps Engineer", department: "Engineering", status: "Active" },
  { id: "ankit", name: "Ankit Patel", role: "Sales Executive", department: "Sales", status: "Active" },
];

type TeamsContextType = {
  members: Member[];
  addMember: (member: Member) => void;
  updateMember: (id: string, updatedMember: Partial<Member>) => void;
  removeMember: (id: string) => void;
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const addMember = (member: Member) => {
    setMembers(prev => [...prev, member]);
  };

  const updateMember = (id: string, updatedMember: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedMember } : m));
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <TeamsContext.Provider value={{ members, addMember, updateMember, removeMember }}>
      {children}
    </TeamsContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamsProvider");
  }
  return context;
}
