"use client";

import { useState, useEffect, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RoadmapBoard from "@/components/RoadmapBoard";
import EmptyBoardState from "@/components/boards/EmptyBoardState";
import CreateBoardModal, { CustomBoard } from "@/components/boards/CreateBoardModal";
import MyTasksBoard from "@/components/chat/templates/MyTasksBoard";
import { getTemplateById, ChannelTemplate } from "@/lib/templateData";
import { Plus, ChevronDown, Check, FolderKanban } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function BoardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasBoards, setHasBoards] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<ChannelTemplate | null>(null);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [customBoards, setCustomBoards] = useState<CustomBoard[]>([]);
  const [activeBoardTitle, setActiveBoardTitle] = useState<string>("Product Roadmap");
  const [activeBoardBg, setActiveBoardBg] = useState<string>("from-indigo-600 to-purple-600");
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);

  // Load custom boards and active board from localStorage or URL
  const loadBoards = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("custom_workspace_boards");
      if (stored) {
        try {
          const parsed: CustomBoard[] = JSON.parse(stored);
          setCustomBoards(parsed);
        } catch (e) {}
      }

      const activeTitle = localStorage.getItem("active_board_title");
      if (activeTitle) setActiveBoardTitle(activeTitle);

      const activeBg = localStorage.getItem("active_board_bg");
      if (activeBg) setActiveBoardBg(activeBg);

      // Check URL query param first (?template=... or ?id=...)
      const queryTemplate = searchParams.get("template");
      if (queryTemplate) {
        const found = getTemplateById(queryTemplate);
        if (found) {
          setActiveTemplate(found);
          localStorage.setItem("active_board_template", found.id);
          return;
        }
      }

      const templateId = localStorage.getItem("active_board_template");
      if (templateId) {
        const found = getTemplateById(templateId);
        if (found) {
          setActiveTemplate(found);
        } else {
          setActiveTemplate(null);
        }
      } else {
        setActiveTemplate(null);
      }
    }
  };

  useEffect(() => {
    loadBoards();
  }, [searchParams]);

  const handleSelectBoard = (board: CustomBoard) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("active_board_id", board.id);
      localStorage.setItem("active_board_title", board.title);
      localStorage.setItem("active_board_bg", board.bgGradient);

      if (board.templateId) {
        localStorage.setItem("active_board_template", board.templateId);
      } else {
        localStorage.removeItem("active_board_template");
      }
    }

    setActiveBoardTitle(board.title);
    setActiveBoardBg(board.bgGradient);

    if (board.templateId) {
      const found = getTemplateById(board.templateId);
      setActiveTemplate(found || null);
    } else {
      setActiveTemplate(null);
    }

    setIsBoardDropdownOpen(false);
  };

  const handleBoardCreated = (board: CustomBoard) => {
    setCustomBoards((prev) => [board, ...prev]);
    handleSelectBoard(board);
  };

  // If a template is active, render the full-screen Trello board all over the page!
  if (activeTemplate) {
    return (
      <MyTasksBoard
        template={activeTemplate}
        onBackToDashboard={() => {
          setActiveTemplate(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("active_board_template");
          }
          router.push("/boards");
        }}
        onSwitchTemplate={(templateId) => {
          const found = getTemplateById(templateId);
          if (found) {
            setActiveTemplate(found);
            if (typeof window !== "undefined") {
              localStorage.setItem("active_board_template", found.id);
            }
            router.push(`/boards?template=${found.id}`);
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col px-5 py-4">
          
          {/* Top Board Switcher & Actions Bar */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-200/80 shrink-0">
            <div className="flex items-center gap-3">
              {/* Board Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsBoardDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-extrabold text-gray-900 shadow-2xs transition-all cursor-pointer group"
                >
                  <div
                    className={`w-4 h-4 rounded-md bg-gradient-to-tr ${activeBoardBg} shrink-0 shadow-xs`}
                  />
                  <span className="text-sm font-black tracking-tight">{activeBoardTitle}</span>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>

                {/* Dropdown Menu */}
                {isBoardDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-xl z-30 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Workspace Boards
                    </div>

                    {/* Standard Product Roadmap */}
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("active_board_template");
                          localStorage.setItem("active_board_title", "Product Roadmap");
                          localStorage.setItem("active_board_bg", "from-indigo-600 to-purple-600");
                        }
                        setActiveBoardTitle("Product Roadmap");
                        setActiveBoardBg("from-indigo-600 to-purple-600");
                        setActiveTemplate(null);
                        setIsBoardDropdownOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl hover:bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-indigo-600 to-purple-600 shrink-0" />
                        <span className="truncate">Product Roadmap</span>
                      </div>
                      {activeBoardTitle === "Product Roadmap" && !activeTemplate && (
                        <Check size={13} className="text-indigo-600" />
                      )}
                    </button>

                    {/* Custom Created Boards */}
                    {customBoards.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelectBoard(b)}
                        className="w-full px-2.5 py-1.5 rounded-xl hover:bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-4 h-4 rounded-md bg-gradient-to-tr ${b.bgGradient} shrink-0`} />
                          <span className="truncate">{b.title}</span>
                        </div>
                        {activeBoardTitle === b.title && (
                          <Check size={13} className="text-indigo-600" />
                        )}
                      </button>
                    ))}

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsBoardDropdownOpen(false);
                          setIsCreateBoardModalOpen(true);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/70 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                        <span>Create new board</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {activeTemplate && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  Template Board
                </span>
              )}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/templates")}
                className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200/90 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FolderKanban size={13} className="text-gray-500" />
                <span>Templates</span>
              </button>

              <button
                onClick={() => setIsCreateBoardModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Create Board</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          {hasBoards ? (
            <RoadmapBoard
              boardTitle={activeBoardTitle}
              bgGradient={activeBoardBg}
            />
          ) : (
            <EmptyBoardState onCreateBoard={() => setIsCreateBoardModalOpen(true)} />
          )}
        </main>
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onBoardCreated={handleBoardCreated}
      />
    </div>
  );
}

export default function BoardsPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#FAFBFC] flex items-center justify-center text-xs text-gray-500 font-semibold">Loading boards...</div>}>
      <BoardsPageContent />
    </Suspense>
  );
}
