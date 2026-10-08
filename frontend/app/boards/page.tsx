"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import RoadmapBoard from "@/components/RoadmapBoard";
import EmptyBoardState from "@/components/boards/EmptyBoardState";
import CreateBoardModal, { CustomBoard } from "@/components/boards/CreateBoardModal";
import MyTasksBoard from "@/components/chat/templates/MyTasksBoard";
import { getTemplateById, ChannelTemplate } from "@/lib/templateConfig";
import { Plus, ChevronDown, Check, FolderKanban, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL, getAuthHeaders, getActiveWorkspaceId } from "@/lib/apis";
import { useWorkspace } from "@/lib/WorkspaceContext";

function BoardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWorkspace } = useWorkspace();

  const [activeTemplate, setActiveTemplate] = useState<ChannelTemplate | null>(null);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [boards, setBoards] = useState<any[]>([]);
  const [activeBoard, setActiveBoard] = useState<any>(null);
  const [isBoardDropdownOpen, setIsBoardDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadBoards = useCallback(async () => {
    const wsId = currentWorkspace?.id || getActiveWorkspaceId();
    if (!wsId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/boards?workspaceId=${wsId}`, {
        headers: getAuthHeaders({ "x-workspace-id": String(wsId) }),
      });

      if (res.ok) {
        let list = await res.json();
        if (!Array.isArray(list)) list = [];

        // If no boards in workspace, create default Roadmap board
        if (list.length === 0) {
          const createRes = await fetch(`${API_URL}/boards`, {
            method: "POST",
            headers: getAuthHeaders({
              "Content-Type": "application/json",
              "x-workspace-id": String(wsId),
            }),
            body: JSON.stringify({
              title: "Product Roadmap",
              workspaceId: Number(wsId),
              bgGradient: "from-indigo-600 to-purple-600",
            }),
          });
          if (createRes.ok) {
            const newBoard = await createRes.json();
            list = [newBoard];
          }
        }

        setBoards(list);

        const queryId = searchParams.get("id");
        const found = queryId ? list.find((b: any) => String(b.id) === queryId) : null;
        const target = found || list[0] || null;

        if (target) {
          const detailRes = await fetch(`${API_URL}/boards/${target.id}`, {
            headers: getAuthHeaders({ "x-workspace-id": String(wsId) }),
          });
          if (detailRes.ok) {
            const fullBoard = await detailRes.json();
            setActiveBoard(fullBoard);
          } else {
            setActiveBoard(target);
          }
        } else {
          setActiveBoard(null);
        }
      }
    } catch (e) {
      console.error("Failed to load boards:", e);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, searchParams]);

  useEffect(() => {
    // Check URL query param first for template (?template=...)
    const queryTemplate = searchParams.get("template");
    if (queryTemplate) {
      const found = getTemplateById(queryTemplate);
      if (found) {
        setActiveTemplate(found);
        return;
      }
    }
    loadBoards();
  }, [loadBoards, searchParams]);

  const handleSelectBoard = async (boardItem: any) => {
    setIsBoardDropdownOpen(false);
    router.push(`/boards?id=${boardItem.id}`);
  };

  if (activeTemplate) {
    return (
      <MyTasksBoard
        template={activeTemplate}
        onBackToDashboard={() => {
          setActiveTemplate(null);
          router.push("/boards");
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFBFC]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <Topbar />

        <main className="flex-1 min-h-0 overflow-hidden flex flex-col p-4 bg-[#FAFBFC]">
          {/* Top Board Bar */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setIsBoardDropdownOpen(!isBoardDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200/80 rounded-xl shadow-xs hover:bg-gray-50 transition"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-md bg-gradient-to-tr ${
                    activeBoard?.bgGradient || "from-indigo-600 to-purple-600"
                  }`}
                />
                <span className="text-xs font-black text-gray-800">
                  {activeBoard?.title || "Product Roadmap"}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {isBoardDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBoardDropdownOpen(false)} />
                  <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-2 py-1">
                      Workspace Boards
                    </div>

                    {boards.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelectBoard(b)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition text-left ${
                          activeBoard?.id === b.id
                            ? "bg-indigo-50 text-indigo-700"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-3 h-3 rounded-md bg-gradient-to-tr ${b.bgGradient || "from-indigo-600 to-purple-600"}`} />
                          <span className="truncate">{b.title}</span>
                        </div>
                        {activeBoard?.id === b.id && <Check size={14} className="text-indigo-600 shrink-0" />}
                      </button>
                    ))}

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsBoardDropdownOpen(false);
                          setIsCreateBoardModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50/70 rounded-xl transition"
                      >
                        <Plus size={14} /> Create Board
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsCreateBoardModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus size={14} /> New Board
            </button>
          </div>

          {/* Main Board Container */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {boards.length === 0 && !loading ? (
              <EmptyBoardState onCreateBoard={() => setIsCreateBoardModalOpen(true)} />
            ) : (
              <RoadmapBoard
                board={activeBoard}
                boardTitle={activeBoard?.title || "Kanban Board"}
                bgGradient={activeBoard?.bgGradient || "from-indigo-600 to-purple-600"}
                onBoardUpdated={loadBoards}
              />
            )}
          </div>
        </main>
      </div>

      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onBoardCreated={() => {
          loadBoards();
        }}
        defaultWorkspace={currentWorkspace?.name || "Workspace"}
      />
    </div>
  );
}

export default function BoardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#FAFBFC]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      }
    >
      <BoardsPageContent />
    </Suspense>
  );
}
