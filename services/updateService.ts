import { Platform } from "react-native";
import Constants from "expo-constants";

const GITHUB_API =
  "https://api.github.com/repos/lunethosd/Ukiyo/releases/latest";

export interface UpdateInfo {
  hasUpdate: boolean;
  latestTag?: string;
  htmlUrl?: string;
  body?: string;
  current?: string;
}

export async function checkForUpdate(): Promise<UpdateInfo> {
  const current =
    Constants.expoConfig?.version ||
    Constants.nativeAppVersion ||
    "1.0.0";
  try {
    const res = await fetch(GITHUB_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return { hasUpdate: false, current };
    const data = await res.json();
    const tag = String(data.tag_name || "").replace(/^v/i, "");
    const hasUpdate = tag && tag !== current && isNewer(tag, current);
    return {
      hasUpdate: !!hasUpdate,
      latestTag: tag,
      htmlUrl: data.html_url,
      body: data.body,
      current,
    };
  } catch {
    return { hasUpdate: false, current };
  }
}

function isNewer(a: string, b: string): boolean {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true;
    if ((pa[i] || 0) < (pb[i] || 0)) return false;
  }
  return false;
}
