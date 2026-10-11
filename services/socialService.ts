import { Config } from "@/constants/Config";

const headers = () => ({
  apikey: Config.SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${Config.SUPABASE_PUBLISHABLE_KEY}`,
  Accept: "application/json",
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

const base = () => Config.SUPABASE_URL;

export type PublicProfile = {
  nickname: string;
  name?: string;
  photo_uri?: string | null;
  banner_uri?: string | null;
  bio?: string | null;
  badge?: string | null;
  is_artist?: boolean;
  followers_count?: number;
  following_count?: number;
  visits_count?: number;
  is_public?: boolean;
};

function mapRow(r: any): PublicProfile {
  return {
    nickname: r.username || r.nickname || "",
    name: r.display_name || r.name || r.username,
    photo_uri: r.photo_uri || r.avatar_url || null,
    banner_uri: r.banner_uri || r.banner_url || null,
    bio: r.bio ?? null,
    badge: r.badge ?? "none",
    is_artist: r.is_artist ?? false,
    followers_count: r.followers_count ?? 0,
    following_count: r.following_count ?? 0,
    visits_count: r.visits_count ?? 0,
    is_public: r.is_public ?? true,
  };
}

export async function searchProfiles(q: string): Promise<PublicProfile[]> {
  if (!q.trim()) return [];
  try {
    const res = await fetch(
      `${base()}/rest/v1/profiles?or=(username.ilike.*${encodeURIComponent(q)}*,display_name.ilike.*${encodeURIComponent(q)}*)&is_public=eq.true&limit=20`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return (rows as any[]).map(mapRow);
  } catch {
    return [];
  }
}

export async function getProfile(nickname: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(
      `${base()}/rest/v1/profiles?username=eq.${encodeURIComponent(nickname)}&limit=1`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0] ? mapRow(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function upsertMyProfile(p: {
  nickname: string;
  name?: string;
  email?: string;
  photo_uri?: string | null;
  banner_uri?: string | null;
  bio?: string | null;
  badge?: string | null;
  is_artist?: boolean;
  is_public?: boolean;
}) {
  try {
    // upsert by username
    const body = {
      username: p.nickname,
      display_name: p.name ?? p.nickname,
      avatar_url: p.photo_uri ?? null,
      photo_uri: p.photo_uri ?? null,
      banner_url: p.banner_uri ?? null,
      banner_uri: p.banner_uri ?? null,
      bio: p.bio ?? null,
      badge: p.badge ?? "none",
      is_artist: p.is_artist ?? false,
      is_public: p.is_public ?? true,
      updated_at: new Date().toISOString(),
    };
    // try PATCH first
    const patch = await fetch(
      `${base()}/rest/v1/profiles?username=eq.${encodeURIComponent(p.nickname)}`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify(body),
      }
    );
    if (patch.ok) {
      const rows = await patch.json().catch(() => []);
      if (Array.isArray(rows) && rows.length) return;
    }
    await fetch(`${base()}/rest/v1/profiles`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
  } catch {}
}

export async function recordVisit(nickname: string) {
  try {
    const p = await getProfile(nickname);
    if (!p) return;
    await fetch(
      `${base()}/rest/v1/profiles?username=eq.${encodeURIComponent(nickname)}`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({
          visits_count: (p.visits_count || 0) + 1,
        }),
      }
    );
  } catch {}
}

export async function follow(fromNick: string, toNick: string) {
  try {
    await fetch(`${base()}/rest/v1/profile_follows`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ follower: fromNick, following: toNick }),
    });
  } catch {}
}

export type FavTrack = {
  id: string;
  track_id: string;
  title: string | null;
  artist: string | null;
  artwork: string | null;
  url: string | null;
};

export async function listFavorites(nickname: string): Promise<FavTrack[]> {
  try {
    const res = await fetch(
      `${base()}/rest/v1/profile_favorites?nickname=eq.${encodeURIComponent(nickname)}&order=created_at.desc&limit=50`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as FavTrack[];
  } catch {
    return [];
  }
}

export async function addFavorite(
  nickname: string,
  track: {
    id: string;
    title: string;
    artist: string;
    artwork?: string;
    url?: string;
  }
) {
  try {
    await fetch(`${base()}/rest/v1/profile_favorites`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        nickname,
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork ?? null,
        url: track.url ?? null,
      }),
    });
  } catch {}
}

export async function removeFavorite(nickname: string, trackId: string) {
  await fetch(
    `${base()}/rest/v1/profile_favorites?nickname=eq.${encodeURIComponent(nickname)}&track_id=eq.${encodeURIComponent(trackId)}`,
    { method: "DELETE", headers: headers() }
  );
}
