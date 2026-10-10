import { RuntimeConfig } from "@/constants/Config";

const TIMEOUT_MS = 240_000;

export class SekiApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const base = RuntimeConfig.SEKI_API_URL.replace(/\/$/, "");
      const response = await fetch(`${base}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "X-API-Key": RuntimeConfig.SEKI_API_KEY,
          "Bypass-Tunnel-Reminder": "true",
          ...options.headers,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const text = await response.text();
      if (!text || text.trim() === "") {
        throw new Error("Empty response body");
      }
      return JSON.parse(text) as T;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out after 4 minutes");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static async search(query: string) {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  }

  static async getSong(id: string) {
    return this.request(`/api/song/${id}`);
  }
}
