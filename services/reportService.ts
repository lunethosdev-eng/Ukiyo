import { Config } from "@/constants/Config";

const headers = () => ({
  apikey: Config.SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${Config.SUPABASE_PUBLISHABLE_KEY}`,
  Accept: "application/json",
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

export async function submitReport(input: {
  type: string;
  message: string;
  nickname?: string;
  email?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${Config.SUPABASE_URL}/rest/v1/reports`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        type: input.type,
        message: input.message,
        nickname: input.nickname ?? null,
        email: input.email ?? null,
        created_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      // fallback local if table missing
      console.warn("submitReport", t);
      return { ok: false, error: t.slice(0, 120) };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "network" };
  }
}
