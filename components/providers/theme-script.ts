// Shared by the pre-paint inline script (layout.tsx) and ThemeProvider.
// Kept outside the "use client" module so the server layout receives plain values.
export const THEME_STORAGE_KEY = "theme-preference";
export const LEGACY_THEME_STORAGE_KEY = "theme";
// Local time 08:00–16:59 -> light, otherwise dark.
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 17;

// Runs in <head> before first paint so dark visitors never see the light
// background flash while the static page waits for React to hydrate.
// Mirrors ThemeProvider: per-visit ?theme= override > saved choice > local time.
export const themeInitScript = `(function(){try{
var q=new URLSearchParams(location.search).get("theme");
var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
var h=new Date().getHours();
var t=(q==="light"||q==="dark")?q:(s==="light"||s==="dark")?s:(h>=${DAY_START_HOUR}&&h<${DAY_END_HOUR}?"light":"dark");
document.documentElement.setAttribute("data-theme",t);
}catch(e){}})();`;
