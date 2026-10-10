import { Config, applyRemoteConfig, RuntimeConfig } from "@/constants/Config";

const headers = () => ({
  apikey: Config.SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${Config.SUPABASE_PUBLISHABLE_KEY}`,
  Accept: "application/json",
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

/** Carga app_config desde Supabase y aplica a RuntimeConfig. */
export async function loadRemoteConfig(): Promise<Record<string, string>> {
  try {
    const res = await fetch(
      `${Config.SUPABASE_URL}/rest/v1/app_config?select=key,value`,
      { headers: headers() }
    );
    if (!res.ok) {
      console.warn("remoteConfig HTTP", res.status);
      return {};
    }
    const rows = (await res.json()) as { key: string; value: string }[];
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    applyRemoteConfig(map);
    return map;
  } catch (e) {
    console.warn("loadRemoteConfig:", e);
    return {};
  }
}

/** Actualiza una clave global (solo admin). */
export async function setConfigKey(key: string, value: string): Promise<boolean> {
  try {
    const res = await fetch(`${Config.SUPABASE_URL}/rest/v1/app_config`, {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) {
      // fallback PATCH
      const res2 = await fetch(
        `${Config.SUPABASE_URL}/rest/v1/app_config?key=eq.${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({ value, updated_at: new Date().toISOString() }),
        }
      );
      if (!res2.ok) {
        console.warn("setConfigKey failed", await res2.text());
        return false;
      }
    }
    applyRemoteConfig({ [key]: value });
    return true;
  } catch (e) {
    console.warn("setConfigKey:", e);
    return false;
  }
}

export type Announcement = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    const res = await fetch(
      `${Config.SUPABASE_URL}/rest/v1/announcements?select=*&active=eq.true&order=created_at.desc&limit=20`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as Announcement[];
  } catch {
    return [];
  }
}

export async function createAnnouncement(input: {
  title: string;
  body?: string;
  image_url?: string;
}): Promise<Announcement | null> {
  try {
    const res = await fetch(`${Config.SUPABASE_URL}/rest/v1/announcements`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        title: input.title,
        body: input.body ?? null,
        image_url: input.image_url ?? null,
        active: true,
      }),
    });
    if (!res.ok) {
      console.warn("createAnnouncement", await res.text());
      return null;
    }
    const rows = (await res.json()) as Announcement[];
    return rows[0] ?? null;
  } catch (e) {
    console.warn("createAnnouncement:", e);
    return null;
  }
}

export async function deactivateAnnouncement(id: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${Config.SUPABASE_URL}/rest/v1/announcements?id=eq.${id}`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ active: false }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** Registra token Expo Push para notificaciones fuera de la app. */
export async function registerPushToken(token: string, platform: string) {
  try {
    await fetch(`${Config.SUPABASE_URL}/rest/v1/push_tokens`, {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        token,
        platform,
        updated_at: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.warn("registerPushToken:", e);
  }
}

export async function fetchAllPushTokens(): Promise<string[]> {
  try {
    const res = await fetch(
      `${Config.SUPABASE_URL}/rest/v1/push_tokens?select=token`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as { token: string }[];
    return rows.map((r) => r.token);
  } catch {
    return [];
  }
}

/**
 * Envía push a todos los tokens registrados vía Expo Push API.
 * Funciona cuando la app está cerrada / en background.
 */
export async function broadcastPush(title: string, body: string, data?: object) {
  const tokens = await fetchAllPushTokens();
  if (!tokens.length) return { sent: 0 };

  const messages = tokens.map((to) => ({
    to,
    sound: "default" as const,
    title,
    body,
    data: data ?? {},
  }));

  // Expo acepta batches de hasta 100
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });
      if (res.ok) sent += chunk.length;
    } catch (e) {
      console.warn("broadcastPush chunk:", e);
    }
  }
  return { sent };
}

export { RuntimeConfig };
