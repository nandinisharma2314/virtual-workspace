export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1]
      : null;
  const headers: Record<string, string> = {
    ...extraHeaders,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
