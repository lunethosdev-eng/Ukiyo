import Constants from "expo-constants";

/** true solo en el APK de administración (paquete distinto). */
export const IS_ADMIN_APP =
  Constants.expoConfig?.extra?.isAdminApp === true ||
  process.env.EXPO_PUBLIC_IS_ADMIN === "1";
