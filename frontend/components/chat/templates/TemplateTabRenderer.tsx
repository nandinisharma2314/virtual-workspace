"use client";

import React from 'react';
import { ChannelTemplate } from '@/lib/templateData';
import MyTasksBoard from './MyTasksBoard';
import FeedbackIntakeTab from './FeedbackIntakeTab';
import NewHireOnboardingTab from './NewHireOnboardingTab';
import TierListTab from './TierListTab';
import SalesPipelineTab from './SalesPipelineTab';

interface TemplateTabRendererProps {
  template: ChannelTemplate;
  activeTab: string;
  onSwitchTab?: (tab: string) => void;
  onAddTask?: (task: any) => void;
  onBackToDashboard?: () => void;
}

export default function TemplateTabRenderer({
  template,
  activeTab,
  onSwitchTab,
  onAddTask,
  onBackToDashboard,
}: TemplateTabRendererProps) {
  const normTab = (activeTab || '').toLowerCase();

  // If the active tab is Board or template is my-tasks, render the full Trello board
  if (normTab === 'board' || template.id === 'my-tasks') {
    return (
      <MyTasksBoard
        template={template}
        subTab="board"
        onAddTask={onAddTask}
        onSwitchTab={onSwitchTab}
        onBackToDashboard={onBackToDashboard}
      />
    );
  }

  // 2. Feedback intake and triage
  if (template.id === 'feedback-intake') {
    if (normTab.includes('triage') || normTab.includes('queue')) {
      return (
        <FeedbackIntakeTab
          template={template}
          subTab="triage-queue"
          onAddTask={onAddTask}
          onSwitchTab={onSwitchTab}
        />
      );
    }
    return (
      <FeedbackIntakeTab
        template={template}
        subTab="feedback-instructions"
        onAddTask={onAddTask}
        onSwitchTab={onSwitchTab}
      />
    );
  }

  // 3. New Hire Onboarding
  if (template.id === 'new-hire') {
    return (
      <NewHireOnboardingTab
        template={template}
        onAddTask={onAddTask}
        onSwitchTab={onSwitchTab}
      />
    );
  }

  // 4. Tier List
  if (template.id === 'tier-list') {
    return (
      <TierListTab
        template={template}
        onAddTask={onAddTask}
        onSwitchTab={onSwitchTab}
      />
    );
  }

  // 5. Sales deal tracking
  if (template.id === 'sales-deal') {
    if (normTab.includes('pipeline')) {
      return (
        <SalesPipelineTab
          template={template}
          subTab="pipeline"
          onAddTask={onAddTask}
          onSwitchTab={onSwitchTab}
        />
      );
    }
    return (
      <SalesPipelineTab
        template={template}
        subTab="deal-hub"
        onAddTask={onAddTask}
        onSwitchTab={onSwitchTab}
      />
    );
  }

  // Default fallback if unknown template tab
  return (
    <div className="flex-1 flex items-center justify-center bg-[#FAFBFC] p-8">
      <div className="text-center max-w-sm">
        <h3 className="text-gray-900 font-bold text-base">{activeTab}</h3>
        <p className="text-xs text-gray-500 mt-1">This section is loaded from the {template.name} template.</p>
      </div>
    </div>
  );
}
