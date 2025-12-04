// client/src/utils/callTawk.js

/**
 * Safely call a Tawk_API function.
 * - Prevents console errors when Tawk is blocked by browser/adblock.
 * - Queues calls until the script loads.
 * - Silently fails if loading failed.
 */

export function callTawk(fnName, ...args) {
  if (typeof window === "undefined") return false;

  // If browser blocked Tawk script (ERR_BLOCKED_BY_CLIENT)
  if (window.__TAWK_LOAD_ERROR__) {
    console.warn("[Tawk] Script blocked or failed to load.");
    return false;
  }

  // If Tawk has not loaded yet → queue the call
  if (!window.Tawk_API) {
    window.__TAWK_QUEUE__ = window.__TAWK_QUEUE__ || [];
    window.__TAWK_QUEUE__.push({ fnName, args });
    return false;
  }

  // Tawk loaded → try calling the function
  try {
    const fn = window.Tawk_API[fnName];
    if (typeof fn === "function") {
      fn(...args);
      return true;
    } else {
      console.warn(`[Tawk] Function ${fnName} does not exist on Tawk_API`);
    }
  } catch (err) {
    console.warn(`[Tawk] Error calling function ${fnName}`, err);
  }

  return false;
}
