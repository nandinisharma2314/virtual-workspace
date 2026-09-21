"use client";

import React, { useState, useEffect } from 'react';
import { Play, Plus, AlertCircle, CheckCircle2, Sliders, ExternalLink, Send, Clock, User, Filter, ShieldAlert, Sparkles, X } from 'lucide-react';
import { ChannelTemplate } from '@/lib/templateConfig';

interface FeedbackIntakeTabProps {
  template: ChannelTemplate;
  subTab?: 'feedback-instructions' | 'triage-queue';
  onAddTask?: (task: any) => void;
  onSwitchTab?: (tab: string) => void;
}

export default function FeedbackIntakeTab({ template, subTab = 'feedback-instructions', onAddTask, onSwitchTab }: FeedbackIntakeTabProps) {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackType, setFeedbackType] = useState<'Bug' | 'Feature' | 'Enhancement' | 'UX'>('Bug');
  const [feedbackPriority, setFeedbackPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [automations, setAutomations] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_automations`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return template.templateConfig?.automations || [
      { id: "a1", name: "Auto-assign High priority bugs to Tech Lead", active: true },
      { id: "a2", name: "Send instant Slack ping when urgent ticket submitted", active: true },
      { id: "a3", name: "Auto-close triaged feedback after 14 days of no response", active: false },
    ];
  });

  const [triageIssues, setTriageIssues] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`template_${template.id}_issues`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return template.templateConfig?.triageIssues || [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_automations`, JSON.stringify(automations));
    }
  }, [automations, template.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_${template.id}_issues`, JSON.stringify(triageIssues));
    }
  }, [triageIssues, template.id]);

  const toggleAutomation = (id: string) => {
    setAutomations((prev: any[]) => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleUpdateStatus = (issueId: string, newStatus: string) => {
    setTriageIssues((prev: any[]) => prev.map(issue => issue.id === issueId ? { ...issue, status: newStatus } : issue));
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTitle.trim()) return;

    const newIssue = {
      id: `T-${Math.floor(100 + Math.random() * 900)}`,
      title: feedbackTitle.trim(),
      type: feedbackType,
      priority: feedbackPriority,
      status: 'Incoming',
      author: 'You (Local User)',
      time: 'Just now'
    };

    setTriageIssues([newIssue, ...triageIssues]);

    if (onAddTask) {
      onAddTask({
        id: `task-${newIssue.id}`,
        title: `[${newIssue.type.toUpperCase()}] ${newIssue.title}`,
        status: 'todo',
        priority: feedbackPriority === 'Critical' ? 'High' : feedbackPriority,
        tag: newIssue.type,
        date: 'Today'
      });
    }

    setFeedbackTitle('');
    setFeedbackDetails('');
    setIsSubmitModalOpen(false);
  };

  const filteredIssues = triageIssues.filter((issue: any) => {
    if (filterType === 'all') return true;
    return issue.type.toLowerCase() === filterType.toLowerCase() || issue.status.toLowerCase() === filterType.toLowerCase();
  });

  if (subTab === 'triage-queue') {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <AlertCircle className="text-blue-600" size={22} /> Feedback Triage Queue
              </h2>
              <p className="text-xs text-gray-500 mt-1">Review incoming reports, change status, and triage into engineering sprint tasks</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-all flex items-center gap-1.5"
              >
                <Plus size={15} /> Submit Feedback
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'Bug', 'Feature', 'UX', 'Incoming', 'Investigating', 'Triaged', 'Resolved'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                  filterType === type ? 'bg-blue-600 text-white shadow-2xs' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Issue Cards */}
          <div className="space-y-3">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue: any) => (
                <div
                  key={issue.id}
                  className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-400">{issue.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${
                        issue.type === 'Bug' ? 'bg-red-50 text-red-600' : (issue.type === 'Feature' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600')
                      }`}>
                        {issue.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        issue.priority === 'Critical' ? 'bg-rose-100 text-rose-700 font-black' : (issue.priority === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600')
                      }`}>
                        {issue.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug">{issue.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User size={12} /> {issue.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {issue.time}</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={issue.status}
                      onChange={(e) => handleUpdateStatus(issue.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                        issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        (issue.status === 'Investigating' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        (issue.status === 'Triaged' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-700 border-gray-200'))
                      }`}
                    >
                      <option value="Incoming">Incoming</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Triaged">Triaged</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-gray-600">No issues found matching "{filterType}"</p>
              </div>
            )}
          </div>
        </div>

        {renderSubmitModal()}
      </div>
    );
  }

  function renderSubmitModal() {
    if (!isSubmitModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-150">
          <button
            onClick={() => setIsSubmitModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Sparkles size={20} />
            <h3 className="text-lg font-extrabold text-gray-900">Submit New Feedback</h3>
          </div>
          <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Issue / Request Title</label>
              <input
                type="text"
                placeholder="Brief summary of the request..."
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={feedbackType}
                  onChange={(e: any) => setFeedbackType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-medium"
                >
                  <option value="Bug">Bug Report</option>
                  <option value="Feature">Feature Request</option>
                  <option value="Enhancement">Enhancement</option>
                  <option value="UX">UX Improvement</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Severity</label>
                <select
                  value={feedbackPriority}
                  onChange={(e: any) => setFeedbackPriority(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 font-medium"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Details (Optional)</label>
              <textarea
                rows={3}
                placeholder="Steps to reproduce, expected behavior, or context..."
                value={feedbackDetails}
                onChange={(e) => setFeedbackDetails(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Send size={13} /> Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Card */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldAlert size={14} /> Triage Portal
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Feedback Instructions & Workflow</h1>
            <p className="mt-2 text-white/90 text-sm max-w-xl leading-relaxed">
              Looking to submit or manage customer requests and bug tickets? Welcome! You're in the right place.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm shadow-sm hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Submit New Feedback
              </button>
              <button
                onClick={() => onSwitchTab && onSwitchTab('Triage Queue')}
                className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-sm transition-all flex items-center gap-2"
              >
                <AlertCircle size={16} /> View Triage Queue ({triageIssues.length})
              </button>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-[#E8F2FA] rounded-2xl border border-blue-200/80 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Play size={20} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1164A3] text-base">Need to submit a feedback? Use this workflow.</h3>
              <p className="text-xs text-blue-800/80 mt-0.5">Automations instantly route bugs to engineering and alert the team.</p>
            </div>
          </div>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm transition-all"
          >
            Submit Feedback
          </button>
        </div>

        {/* Automated Workflow Rules */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Sliders size={18} className="text-indigo-600" /> Channel Triage Automations
            </h3>
            <span className="text-xs text-gray-500">{automations.filter((a: any) => a.active).length} active rules</span>
          </div>
          <div className="space-y-2.5">
            {automations.map((automation: any) => (
              <div
                key={automation.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-800">{automation.name}</span>
                <button
                  onClick={() => toggleAutomation(automation.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${automation.active ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full shadow-sm transition-transform absolute top-1 ${automation.active ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3 text-xs">1</div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Collect requests</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Centralize user issues and tickets in one transparent channel queue.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3 text-xs">2</div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Prioritize & assign</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Sort by severity and route critical issues to engineering sprints.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold mb-3 text-xs">3</div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Resolve & notify</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Automate status updates to keep customers informed every step.</p>
          </div>
        </div>
      </div>

      {renderSubmitModal()}
    </div>
  );
}
