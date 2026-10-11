import { Config } from "@/constants/Config";

const headers = () => ({
  apikey: Config.SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${Config.SUPABASE_PUBLISHABLE_KEY}`,
  Accept: "application/json",
  "Content-Type": "application/json",
  Prefer: "return=representation",
});

const base = () => Config.SUPABASE_URL;

export type Conversation = {
  id: string;
  is_group: boolean;
  title: string | null;
  wallpaper_url: string | null;
  created_by: string | null;
  updated_at: string;
  last_message?: string;
  other_nickname?: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_nickname: string;
  body: string;
  created_at: string;
};

export type MessageRequest = {
  id: string;
  from_nickname: string;
  to_nickname: string;
  body: string | null;
  status: string;
  created_at: string;
};

export async function listConversations(myNick: string): Promise<Conversation[]> {
  try {
    const mem = await fetch(
      `${base()}/rest/v1/conversation_members?user_nickname=eq.${encodeURIComponent(myNick)}&select=conversation_id`,
      { headers: headers() }
    );
    if (!mem.ok) return [];
    const ids = ((await mem.json()) as { conversation_id: string }[]).map((r) => r.conversation_id);
    if (!ids.length) return [];
    const res = await fetch(
      `${base()}/rest/v1/conversations?id=in.(${ids.join(",")})&order=updated_at.desc`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as Conversation[];
  } catch {
    return [];
  }
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  try {
    const res = await fetch(
      `${base()}/rest/v1/messages?conversation_id=eq.${conversationId}&order=created_at.asc&limit=200`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as Message[];
  } catch {
    return [];
  }
}

export async function sendMessage(
  conversationId: string,
  sender: string,
  body: string
): Promise<Message | null> {
  try {
    const res = await fetch(`${base()}/rest/v1/messages`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_nickname: sender,
        body,
      }),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    await fetch(
      `${base()}/rest/v1/conversations?id=eq.${conversationId}`,
      {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ updated_at: new Date().toISOString() }),
      }
    );
    return Array.isArray(rows) ? rows[0] : rows;
  } catch {
    return null;
  }
}

export async function startDm(myNick: string, otherNick: string): Promise<string | null> {
  // Look for existing 1:1
  try {
    const mine = await listConversations(myNick);
    for (const c of mine) {
      if (c.is_group) continue;
      const mem = await fetch(
        `${base()}/rest/v1/conversation_members?conversation_id=eq.${c.id}&select=user_nickname`,
        { headers: headers() }
      );
      if (!mem.ok) continue;
      const nicks = ((await mem.json()) as { user_nickname: string }[]).map((x) => x.user_nickname);
      if (nicks.includes(otherNick) && nicks.includes(myNick)) return c.id;
    }
    const res = await fetch(`${base()}/rest/v1/conversations`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        is_group: false,
        title: null,
        created_by: myNick,
      }),
    });
    if (!res.ok) return null;
    const conv = (await res.json())[0];
    await fetch(`${base()}/rest/v1/conversation_members`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify([
        { conversation_id: conv.id, user_nickname: myNick, role: "member" },
        { conversation_id: conv.id, user_nickname: otherNick, role: "member" },
      ]),
    });
    return conv.id as string;
  } catch {
    return null;
  }
}

export async function createGroup(
  myNick: string,
  title: string,
  members: string[]
): Promise<string | null> {
  try {
    const res = await fetch(`${base()}/rest/v1/conversations`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        is_group: true,
        title,
        created_by: myNick,
      }),
    });
    if (!res.ok) return null;
    const conv = (await res.json())[0];
    const rows = [myNick, ...members.filter((m) => m !== myNick)].map((n) => ({
      conversation_id: conv.id,
      user_nickname: n,
      role: n === myNick ? "admin" : "member",
    }));
    await fetch(`${base()}/rest/v1/conversation_members`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(rows),
    });
    return conv.id as string;
  } catch {
    return null;
  }
}

export async function setWallpaper(conversationId: string, url: string) {
  await fetch(`${base()}/rest/v1/conversations?id=eq.${conversationId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ wallpaper_url: url }),
  });
}

export async function sendMessageRequest(
  from: string,
  to: string,
  body: string
): Promise<boolean> {
  try {
    const res = await fetch(`${base()}/rest/v1/message_requests`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        from_nickname: from,
        to_nickname: to,
        body,
        status: "pending",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listMessageRequests(myNick: string): Promise<MessageRequest[]> {
  try {
    const res = await fetch(
      `${base()}/rest/v1/message_requests?to_nickname=eq.${encodeURIComponent(myNick)}&status=eq.pending&order=created_at.desc`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    return (await res.json()) as MessageRequest[];
  } catch {
    return [];
  }
}

export async function respondRequest(
  id: string,
  accept: boolean,
  myNick: string,
  fromNick: string
): Promise<string | null> {
  await fetch(`${base()}/rest/v1/message_requests?id=eq.${id}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ status: accept ? "accepted" : "rejected" }),
  });
  if (!accept) return null;
  return startDm(myNick, fromNick);
}
