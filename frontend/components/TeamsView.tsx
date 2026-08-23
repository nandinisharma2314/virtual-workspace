"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Plus, Filter, MoreVertical, Mail, Phone, Calendar, User, Edit2, Trash2, X } from "lucide-react";
import { avatarColors } from "@/lib/data";

const initialMembers = [
  { id: "avi", name: "Avi Singh", role: "Frontend Developer", department: "Engineering", status: "Active" },
  { id: "rohit", name: "Rohit Verma", role: "Backend Developer", department: "Engineering", status: "Active" },
  { id: "priya", name: "Priya Singh", role: "UI/UX Designer", department: "Design", status: "Active" },
  { id: "neha", name: "Neha Sharma", role: "Product Manager", department: "Product", status: "Away" },
  { id: "arjun", name: "Arjun Patel", role: "QA Engineer", department: "Engineering", status: "Active" },
  { id: "rahul", name: "Rahul Sharma", role: "Marketing Lead", department: "Marketing", status: "Offline" },
  { id: "vikram", name: "Vikram Joshi", role: "DevOps Engineer", department: "Engineering", status: "Active" },
  { id: "ankit", name: "Ankit Patel", role: "Sales Executive", department: "Sales", status: "Active" },
];

const departments = ["All Company", "Engineering", "Design", "Product", "Marketing", "Sales"];

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member, onViewProfile, onEditMember, onRemoveMember, currentUserRole }: { member: any, onViewProfile: () => void, onEditMember: () => void, onRemoveMember: () => void, currentUserRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUserRole?.toLowerCase() === 'admin';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatar = avatarColors[member.id as keyof typeof avatarColors] || { initials: member.name.substring(0, 2).toUpperCase(), color: "bg-gray-400" };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-gray-300">
      <div className="absolute right-4 top-4" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50 transition-opacity ${isOpen ? 'opacity-100 bg-gray-50' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
        >
          <MoreVertical size={16} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-8 w-40 rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-20">
            <button onClick={() => { setIsOpen(false); onViewProfile(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
              <User size={14} />
              View Profile
            </button>
            {isAdmin && (
              <>
                <button onClick={() => { setIsOpen(false); onEditMember(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                  <Edit2 size={14} />
                  Edit Member
                </button>
                <div className="h-[1px] bg-gray-100 my-1"></div>
                <button onClick={() => { setIsOpen(false); onRemoveMember(); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 size={14} />
                  Remove
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center text-center mt-2">
        <div className="relative mb-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full text-white font-bold text-[18px] shadow-sm ${avatar.color}`}>
            {avatar.initials}
          </div>
          <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
            member.status === "Active" ? "bg-emerald-500" :
            member.status === "Away" ? "bg-amber-500" : "bg-gray-400"
          }`}></div>
        </div>
        
        <h3 className="text-[15px] font-extrabold text-gray-900">{member.name}</h3>
        <p className="text-[13px] font-medium text-gray-500 mt-0.5">{member.role}</p>
        
        <div className="mt-5 flex gap-2 w-full">
          <Link href="/chat" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <Mail size={14} />
            Message
          </Link>
          <Link href="/meetings" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <Calendar size={14} />
            Meet
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TeamsView() {
  const [members, setMembers] = useState<any[]>([]);
  const [activeDept, setActiveDept] = useState("All Company");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [userRole, setUserRole] = useState("Member");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      fetch("http://localhost:3001/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.role) setUserRole(data.role);
      })
      .catch(console.error);
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:3001/users")
      .then(res => res.json())
      .then(data => {
        const realMembers = data.map((u: any) => ({
          id: u.id,
          name: u.name,
          role: u.role || "Member",
          department: u.department || "Engineering",
          status: u.status || "Active",
          email: u.email
        }));
        setMembers(realMembers);
      })
      .catch(console.error);
  }, []);
  
  // Modals state
  const [viewingMember, setViewingMember] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", role: "", department: "Engineering", status: "Active" });
  
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, memberId: string | null}>({isOpen: false, memberId: null});

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  useEffect(() => {
    if (editingMember) {
      setEditForm(editingMember);
    }
  }, [editingMember]);

  const filteredMembers = members.filter(m => 
    (activeDept === "All Company" || m.department === activeDept) &&
    (filterStatus === "All" || m.status === filterStatus) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSaveEdit = async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    
    try {
      const res = await fetch(`http://localhost:3001/users/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name: editForm.name,
          role: editForm.role,
          department: editForm.department,
          status: editForm.status
        })
      });
      
      if (res.ok) {
        setMembers(members.map(m => m.id === editForm.id ? { ...m, name: editForm.name, role: editForm.role, department: editForm.department, status: editForm.status } : m));
        setEditingMember(null);
        showToast("Member updated successfully!", "success");
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to update role. You may not have Admin privileges.");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error occurred.");
    }
  };

  const handleSaveAdd = () => {
    const newId = addForm.name.toLowerCase().split(' ')[0] + Math.floor(Math.random() * 1000);
    const newMember = { ...addForm, id: newId };
    setMembers([...members, newMember]);
    setIsAddingMember(false);
    setAddForm({ name: "", role: "", department: "Engineering", status: "Active" });
  };

  const confirmRemove = (id: string) => {
    setConfirmModal({ isOpen: true, memberId: id });
  };

  const handleRemove = async () => {
    if (!confirmModal.memberId) return;
    const id = confirmModal.memberId;
    setConfirmModal({ isOpen: false, memberId: null });
    
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setMembers(members.filter(m => m.id !== id));
        showToast("Member removed successfully!", "success");
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to remove member. You may not have Admin privileges.");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error occurred.");
    }
  };

  return (
    <div className="flex w-full h-full min-h-0 bg-transparent overflow-hidden">
      
      {/* Teams Sidebar */}
      <div className="w-[240px] shrink-0 border-r border-gray-200/80 bg-[#F9FAFB] flex flex-col h-full hidden md:flex">
        <div className="p-4 border-b border-gray-200/80">
          <h2 className="text-[14px] font-black text-gray-900 tracking-tight">Departments</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-lg transition-colors ${
                activeDept === dept 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{dept}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeDept === dept ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"
              }`}>
                {dept === "All Company" ? members.length : members.filter(m => m.department === dept).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header */}
        <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-gray-200/80 px-6 bg-white z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-[17px] font-black tracking-tight text-gray-900">
              {activeDept}
            </h1>
            <div className="h-4 w-[1px] bg-gray-300"></div>
            <span className="text-[13px] font-bold text-gray-500">
              {filteredMembers.length} members
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input 
                type="text" 
                placeholder="Search members..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-60 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-[13px] font-medium text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-[13px] font-bold transition-all shadow-sm ${showFilter || filterStatus !== "All" ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Filter size={15} />
                <span>{filterStatus === "All" ? "Filter" : filterStatus}</span>
              </button>
              
              {showFilter && (
                <div className="absolute right-0 top-11 w-48 rounded-xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-20">
                  <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</div>
                  {["All", "Active", "Away", "Offline"].map(status => (
                    <button
                      key={status}
                      onClick={() => { setFilterStatus(status); setShowFilter(false); }}
                      className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold transition-colors ${filterStatus === status ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {status === "All" ? "All Statuses" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {userRole?.toLowerCase() === 'admin' && (
              <button 
                onClick={() => setIsAddingMember(true)}
                className="flex h-9 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-[13px] font-bold text-white transition-all hover:bg-indigo-700 shadow-sm"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Member</span>
              </button>
            )}
          </div>
        </header>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto bg-[#FAFBFC] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-auto max-w-7xl">
            {filteredMembers.map((member: any) => (
              <MemberCard 
                key={member.id} 
                member={member} 
                currentUserRole={userRole}
                onViewProfile={() => setViewingMember(member)}
                onEditMember={() => setEditingMember(member)}
                onRemoveMember={() => confirmRemove(member.id)}
              />
            ))}
          </div>
          
          {filteredMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
                <Search size={24} />
              </div>
              <h3 className="text-[15px] font-bold text-gray-900">No members found</h3>
              <p className="text-[13px] font-medium text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Profile Modal */}
      <Modal isOpen={!!viewingMember} onClose={() => setViewingMember(null)} title="Member Profile">
        {viewingMember && (
          <div className="flex flex-col items-center">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full text-white font-bold text-3xl shadow-sm mb-4 ${(avatarColors[viewingMember.id as keyof typeof avatarColors] || { color: "bg-gray-400" }).color}`}>
              {(avatarColors[viewingMember.id as keyof typeof avatarColors] || { initials: viewingMember.name.substring(0, 2).toUpperCase() }).initials}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{viewingMember.name}</h3>
            <p className="text-sm font-medium text-indigo-600 mb-4">{viewingMember.role}</p>
            
            <div className="w-full space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Department</span>
                <span className="text-sm font-semibold text-gray-900">{viewingMember.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-semibold ${
                  viewingMember.status === "Active" ? "text-emerald-600" :
                  viewingMember.status === "Away" ? "text-amber-600" : "text-gray-600"
                }`}>{viewingMember.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-semibold text-gray-900">{viewingMember.id}@acme.inc</span>
              </div>
            </div>
            
          </div>
        )}
      </Modal>

      {/* Edit Member Modal */}
      <Modal isOpen={!!editingMember} onClose={() => setEditingMember(null)} title="Edit Member">
        {editingMember && (
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={editForm.name || ""} 
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
              <input 
                type="text" 
                value={editForm.role || ""} 
                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
              <select 
                value={editForm.department || ""} 
                onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {departments.filter(d => d !== "All Company").map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
              <select 
                value={editForm.status || ""} 
                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Away">Away</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            
            <div className="pt-4 flex gap-3 w-full">
              <button onClick={() => setEditingMember(null)} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={isAddingMember} onClose={() => setIsAddingMember(false)} title="Add Member">
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              value={addForm.name} 
              onChange={e => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
            <input 
              type="text" 
              value={addForm.role} 
              onChange={e => setAddForm({ ...addForm, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
            <select 
              value={addForm.department} 
              onChange={e => setAddForm({ ...addForm, department: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              {departments.filter(d => d !== "All Company").map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
            <select 
              value={addForm.status} 
              onChange={e => setAddForm({ ...addForm, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="Active">Active</option>
              <option value="Away">Away</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
          
          <div className="pt-4 flex gap-3 w-full">
            <button onClick={() => setIsAddingMember(false)} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleSaveAdd} disabled={!addForm.name || !addForm.role} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Add Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Remove Modal */}
      <Modal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({isOpen: false, memberId: null})} title="Remove Member">
        <div className="flex flex-col space-y-4">
          <p className="text-[13px] font-medium text-gray-600">
            Are you sure you want to remove this member? This action cannot be undone and will permanently delete the member from the system.
          </p>
          <div className="pt-2 flex gap-3 w-full">
            <button onClick={() => setConfirmModal({isOpen: false, memberId: null})} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleRemove} className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-sm">
              Remove
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className={`flex items-center justify-center h-6 w-6 rounded-full ${toast.type === 'success' ? 'bg-emerald-200' : 'bg-red-200'}`}>
            {toast.type === 'success' ? <span className="text-emerald-700 font-bold text-sm">✓</span> : <span className="text-red-700 font-bold text-sm">!</span>}
          </div>
          <span className="text-[13px] font-bold">{toast.message}</span>
          <button onClick={() => setToast(null)} className={`ml-2 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity ${toast.type === 'success' ? 'hover:bg-emerald-200' : 'hover:bg-red-200'}`}>
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
