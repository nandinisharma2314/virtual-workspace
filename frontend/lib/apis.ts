export const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined in environment variables");
}

export function getActiveWorkspaceId(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("active_workspace_id");
  if (stored && !isNaN(Number(stored))) return Number(stored);
  const cookieVal = document.cookie
    .split("; ")
    .find((row) => row.startsWith("active_workspace_id="))
    ?.split("=")[1];
  return cookieVal && !isNaN(Number(cookieVal)) ? Number(cookieVal) : null;
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]
      : null;
  const wsId = getActiveWorkspaceId();
  const headers: Record<string, string> = {
    ...extraHeaders,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (wsId) {
    headers["x-workspace-id"] = String(wsId);
  }
  return headers;
}