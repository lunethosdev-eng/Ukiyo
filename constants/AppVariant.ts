import Constants from "expo-constants";

/**
 * Detecta si este binario es el APK Admin.
 * Se lee de expo.extra.isAdminApp (app.admin.json) o EXPO_PUBLIC_IS_ADMIN.
 */
export function getIsAdminApp(): boolean {
  try {
    const extra = Constants.expoConfig?.extra as { isAdminApp?: boolean } | undefined;
    if (extra?.isAdminApp === true) return true;
  } catch {}
  try {
    if (process.env.EXPO_PUBLIC_IS_ADMIN === "1") return true;
  } catch {}
  return false;
}

/** Alias estable (evitar error Hermes "property doesn't exist" con import malo) */
export const IS_ADMIN_APP = getIsAdminApp();
