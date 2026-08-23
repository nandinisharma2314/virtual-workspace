"use client";

import { useState } from "react";

export default function ProjectSettings() {
  const [activeTab, setActiveTab] = useState("General");
  const settingsTabs = [
    "General",
    "Profile",
    "Team",
    "Roles & Permissions",
    "Notifications",
    "Integrations",
    "Custom Fields",
    "Security",
    "Billing"
  ];

  return (
    <div className="flex-1 min-h-0 p-5 bg-[#FAFBFC] overflow-hidden flex select-none gap-8">
      {/* Settings Sidebar */}
      <div className="w-56 shrink-0 flex flex-col">
        <h2 className="text-[14px] font-black text-gray-900 mb-4 px-3">Settings</h2>
        <div className="flex-1 overflow-y-auto space-y-0.5">
          {settingsTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-xl text-[12.5px] font-bold transition-all ${
                activeTab === tab
                  ? "bg-[#EEE8FF] text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-y-auto">
        <div className="max-w-2xl p-8">
          <h3 className="text-[16px] font-black text-gray-900 mb-6">{activeTab} Settings</h3>
          
          {activeTab === "General" && (
            <div className="space-y-5">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  defaultValue="Acme Inc."
                  className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium"
                />
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Company Email</label>
                <input
                  type="email"
                  defaultValue="contact@acmeinc.com"
                  className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium"
                />
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Time Zone</label>
                <select className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_1rem_center]">
                  <option>(GMT+05:30) Asia/Kolkata</option>
                  <option>(GMT+00:00) Europe/London</option>
                  <option>(GMT-08:00) America/Los_Angeles</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Date Format</label>
                <select className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_1rem_center]">
                  <option>DD MMM, YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Week Starts On</label>
                <select className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_1rem_center]">
                  <option>Monday</option>
                  <option>Sunday</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Language</label>
                <select className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_1rem_center]">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              
              <div className="pt-4">
                <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-[12.5px] font-extrabold shadow-2xs shadow-indigo-500/20 transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "Profile" && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  A
                </div>
                <div>
                  <button className="rounded-xl bg-white border border-gray-200/80 hover:bg-gray-50 text-gray-700 px-4 py-2 text-[12px] font-bold shadow-2xs transition-all">
                    Upload Avatar
                  </button>
                  <p className="text-[11px] text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  defaultValue="Avi Sharma"
                  className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  defaultValue="avi@acmeinc.com"
                  className="w-full h-10 rounded-xl border border-gray-200/80 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Role</label>
                <input
                  type="text"
                  defaultValue="Product Manager"
                  disabled
                  className="w-full h-10 rounded-xl border border-gray-200/80 bg-gray-50 px-3 text-[13px] text-gray-500 shadow-2xs font-medium cursor-not-allowed"
                />
              </div>
              <div className="pt-4">
                <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-[12.5px] font-extrabold shadow-2xs shadow-indigo-500/20 transition-all">
                  Update Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === "Team" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12.5px] text-gray-600 font-medium">Manage your team members and their access levels.</p>
                <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-[12px] font-bold shadow-2xs shadow-indigo-500/20 transition-all">
                  Invite Member
                </button>
              </div>
              <div className="border border-gray-200/80 rounded-xl overflow-hidden">
                {[
                  { name: "Avi Sharma", role: "Admin", email: "avi@acmeinc.com", avatar: "A" },
                  { name: "Priya S.", role: "Editor", email: "priya@acmeinc.com", avatar: "P" },
                  { name: "Rohit V.", role: "Viewer", email: "rohit@acmeinc.com", avatar: "R" },
                ].map((member, i) => (
                  <div key={i} className={`flex items-center justify-between p-3.5 ${i !== 2 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[12px] font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">{member.name}</p>
                        <p className="text-[11.5px] text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[12px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">{member.role}</span>
                      <button className="text-gray-400 hover:text-rose-500 transition-colors text-[12px] font-bold">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Roles & Permissions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12.5px] text-gray-600 font-medium">Define access levels and permissions for different roles.</p>
                <button className="rounded-xl bg-white border border-gray-200/80 hover:bg-gray-50 text-gray-700 px-4 py-2 text-[12px] font-bold shadow-2xs transition-all">
                  Create Role
                </button>
              </div>
              <div className="space-y-4">
                {["Admin", "Editor", "Viewer"].map((role, idx) => (
                  <div key={idx} className="border border-gray-200/80 rounded-xl p-4 bg-gray-50/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[13px] font-bold text-gray-900">{role}</h4>
                      <button className="text-[11.5px] font-bold text-indigo-600 hover:text-indigo-700">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={role === "Admin" || role === "Editor"} disabled className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                        <span className="text-[12px] text-gray-700 font-medium">Create/Edit Tasks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={role === "Admin"} disabled className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                        <span className="text-[12px] text-gray-700 font-medium">Manage Team</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={true} disabled className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                        <span className="text-[12px] text-gray-700 font-medium">View Projects</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={role === "Admin"} disabled className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                        <span className="text-[12px] text-gray-700 font-medium">Project Settings</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="space-y-6">
              <p className="text-[12.5px] text-gray-600 font-medium mb-4">Choose how and when you want to be notified.</p>
              
              <div className="space-y-4">
                <h4 className="text-[13px] font-bold text-gray-900 border-b border-gray-100 pb-2">Email Notifications</h4>
                <div className="space-y-3">
                  {[
                    { label: "New tasks assigned to me", checked: true },
                    { label: "Mentions in comments", checked: true },
                    { label: "Daily summary", checked: false },
                    { label: "Project status changes", checked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[12.5px] text-gray-700 font-medium">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="text-[13px] font-bold text-gray-900 border-b border-gray-100 pb-2">Push Notifications</h4>
                <div className="space-y-3">
                  {[
                    { label: "Direct messages", checked: true },
                    { label: "Task due reminders", checked: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[12.5px] text-gray-700 font-medium">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Integrations" && (
            <div className="space-y-6">
              <p className="text-[12.5px] text-gray-600 font-medium mb-4">Connect your workspace with your favorite tools.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Slack", desc: "Get notifications and create tasks from Slack.", connected: true, color: "text-purple-600" },
                  { name: "GitHub", desc: "Link commits and PRs to your tasks automatically.", connected: true, color: "text-gray-900" },
                  { name: "Figma", desc: "Embed Figma designs directly into task descriptions.", connected: false, color: "text-rose-500" },
                  { name: "Google Drive", desc: "Attach files directly from your Google Drive.", connected: false, color: "text-blue-500" },
                ].map((app, i) => (
                  <div key={i} className="border border-gray-200/80 rounded-2xl p-4 flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-lg ${app.color}`}>
                        {app.name[0]}
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${app.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {app.connected ? 'Connected' : 'Available'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-900 mb-1">{app.name}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{app.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Custom Fields" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12.5px] text-gray-600 font-medium">Add custom data fields to your project tasks.</p>
                <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-[12px] font-bold shadow-2xs shadow-indigo-500/20 transition-all">
                  Add Field
                </button>
              </div>
              
              <div className="border border-gray-200/80 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="py-2.5 px-4 text-[11.5px] font-bold text-gray-500">Field Name</th>
                      <th className="py-2.5 px-4 text-[11.5px] font-bold text-gray-500">Type</th>
                      <th className="py-2.5 px-4 text-[11.5px] font-bold text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Priority", type: "Select (Dropdown)" },
                      { name: "Estimated Hours", type: "Number" },
                      { name: "Sprint", type: "Text" },
                      { name: "Launch Date", type: "Date" },
                    ].map((field, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30">
                        <td className="py-3 px-4 text-[12.5px] font-bold text-gray-800">{field.name}</td>
                        <td className="py-3 px-4">
                          <span className="text-[11.5px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{field.type}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-800 text-[11.5px] font-bold mr-3">Edit</button>
                          <button className="text-rose-500 hover:text-rose-700 text-[11.5px] font-bold">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="space-y-6">
              <p className="text-[12.5px] text-gray-600 font-medium mb-4">Manage your account security and authentication methods.</p>
              
              <div className="space-y-5">
                <div className="border border-gray-200/80 rounded-xl p-4 flex items-center justify-between bg-white">
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 mb-1">Password</h4>
                    <p className="text-[11.5px] text-gray-500">Last changed 3 months ago</p>
                  </div>
                  <button className="rounded-xl bg-white border border-gray-200/80 hover:bg-gray-50 text-gray-700 px-4 py-2 text-[12px] font-bold shadow-2xs transition-all">
                    Change Password
                  </button>
                </div>
                
                <div className="border border-gray-200/80 rounded-xl p-4 flex items-center justify-between bg-white">
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 mb-1">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11.5px] text-gray-500">Add an extra layer of security to your account.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={true} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="border border-gray-200/80 rounded-xl overflow-hidden">
                  <div className="bg-gray-50/50 p-3 border-b border-gray-100">
                    <h4 className="text-[12.5px] font-bold text-gray-700">Active Sessions</h4>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 mb-0.5">Mac OS • Chrome</p>
                      <p className="text-[11.5px] text-emerald-600 font-medium">Active now • Mumbai, India</p>
                    </div>
                    <button className="text-gray-400 hover:text-rose-500 text-[12px] font-bold transition-colors">Log out</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Billing" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12.5px] text-gray-600 font-medium">Manage your subscription and billing details.</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">Current Plan</span>
                    <h3 className="text-2xl font-black mb-1">Pro Plan</h3>
                    <p className="text-indigo-100 text-[13px] font-medium">$12 / user / month</p>
                  </div>
                  <button className="rounded-xl bg-white text-indigo-700 hover:bg-gray-50 px-5 py-2.5 text-[12.5px] font-extrabold shadow-sm transition-all">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-200/80 rounded-xl p-4">
                  <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Method</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-blue-900 rounded flex items-center justify-center text-white text-[10px] font-black italic">VISA</div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">•••• •••• •••• 4242</p>
                      <p className="text-[11.5px] text-gray-500">Expires 12/26</p>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200/80 rounded-xl p-4">
                  <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">Next Invoice</h4>
                  <p className="text-[16px] font-black text-gray-900">$144.00</p>
                  <p className="text-[11.5px] text-gray-500 mt-0.5">Due on Jul 1, 2025</p>
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Billing History</h4>
                <div className="space-y-3">
                  {[
                    { date: "Jun 1, 2025", amount: "$144.00", status: "Paid" },
                    { date: "May 1, 2025", amount: "$144.00", status: "Paid" },
                  ].map((invoice, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-[12.5px] font-medium text-gray-700">{invoice.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[12.5px] font-bold text-gray-900">{invoice.amount}</span>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{invoice.status}</span>
                        <button className="text-[11.5px] font-bold text-indigo-600 hover:text-indigo-800">PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
