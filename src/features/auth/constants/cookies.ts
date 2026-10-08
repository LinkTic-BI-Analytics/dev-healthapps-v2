/** Cookies de sesión (httpOnly). Prefijo `health_apps_` como el resto del almacenamiento del cliente. */
export const ACCESS_COOKIE = "health_apps_access";
export const REFRESH_COOKIE = "health_apps_refresh";
/** El refresh token solo viaja a los endpoints de autenticación. */
export const REFRESH_COOKIE_PATH = "/api/auth";

/** Cabecera que agrega proxy.ts con la ruta actual, para construir el callbackUrl en el servidor. */
export const PATH_HEADER = "x-health-apps-path";
