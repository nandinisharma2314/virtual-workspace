"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_URL } from "./apis";

export interface WorkspaceMemberInfo {
  roleId?: number | null;
  roleName: string;
  customRoleLabel: string;
  permissions: string[];
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  ownerId?: number;
  isOwner?: boolean;
  createdAt?: string;
  currentMember?: WorkspaceMemberInfo;
}

export interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentMember: WorkspaceMemberInfo | null;
  isLoading: boolean;
  can: (permission: string) => boolean;
  setCurrentWorkspaceId: (id: number) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace | null>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1] ||
      null
    );
  };

  const refreshWorkspaces = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/workspaces`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const list: Workspace[] = await res.json();
        setWorkspaces(list);

        if (list.length > 0) {
          const storedId = localStorage.getItem("active_workspace_id");
          const found = storedId ? list.find((w) => w.id === Number(storedId)) : null;
          const active = found || list[0];
          setCurrentWorkspace(active);
          localStorage.setItem("active_workspace_id", String(active.id));
          document.cookie = `active_workspace_id=${active.id}; path=/; max-age=2592000; SameSite=Lax`;
        } else {
          setCurrentWorkspace(null);
        }
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  // Intercept fetch calls to API_URL and automatically attach active x-workspace-id
  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      try {
        const urlStr =
          typeof resource === "string"
            ? resource
            : resource instanceof URL
            ? resource.toString()
            : resource instanceof Request
            ? resource.url
            : "";
        if (API_URL && urlStr.includes(API_URL)) {
          const wsId = localStorage.getItem("active_workspace_id");
          if (wsId) {
            config = config || {};
            const headers = new Headers(config.headers || {});
            if (!headers.has("x-workspace-id")) {
              headers.set("x-workspace-id", wsId);
            }
            config.headers = headers;
          }
        }
      } catch (e) {
        // Continue silently if header insertion encounters an issue
      }
      return originalFetch(resource, config);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const setCurrentWorkspaceId = (id: number) => {
    const found = workspaces.find((w) => w.id === id);
    if (found) {
      setCurrentWorkspace(found);
      localStorage.setItem("active_workspace_id", String(id));
      document.cookie = `active_workspace_id=${id}; path=/; max-age=2592000; SameSite=Lax`;
      // Dispatch custom event so listeners know workspace changed
      window.dispatchEvent(new CustomEvent("workspaceChanged", { detail: found }));
    }
  };

  const createWorkspace = async (name: string, description?: string): Promise<Workspace | null> => {
    const token = getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        const newWs: Workspace = await res.json();
        await refreshWorkspaces();
        setCurrentWorkspaceId(newWs.id);
        return newWs;
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
    }
    return null;
  };

  const can = (permission: string): boolean => {
    if (!currentWorkspace) return false;
    if (currentWorkspace.isOwner) return true;
    const member = currentWorkspace.currentMember;
    if (!member) return false;
    if (member.roleName?.toLowerCase() === "admin") return true;
    return member.permissions?.includes(permission) ?? false;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        currentMember: currentWorkspace?.currentMember || null,
        isLoading,
        can,
        setCurrentWorkspaceId,
        refreshWorkspaces,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
