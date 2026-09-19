import { cookies } from "next/headers";
import { API_URL } from "@/lib/apis";

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    return null;
  }
}
