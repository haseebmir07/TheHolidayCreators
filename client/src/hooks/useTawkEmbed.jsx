// client/src/hooks/useTawkEmbed.jsx
import { useEffect } from "react";

/**
 * useTawkEmbed
 * Use in App.jsx to lazy-load Tawk safely.
 * Replace YOUR_ID_HERE with your Tawk ID in index.html snippet OR keep both (duplicate-safe).
 */
export default function useTawkEmbed() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__TAWK_DISABLED__) return;

    function attach() {
      // skip if already attached
      if (document.querySelector('script[src*="embed.tawk.to"]')) return;
      const s = document.createElement("script");
      s.src = "https://embed.tawk.to/692ecc40e038f8197ec119ff/1jbfcrnqa";
      s.async = true;
      s.defer = true;
      s.onload = () => { window.__TAWK_LOADED__ = true; };
      s.onerror = () => { window.__TAWK_LOAD_ERROR__ = true; };
      document.body.appendChild(s);
    }

    if (document.readyState === "complete") {
      setTimeout(attach, 300);
    } else {
      window.addEventListener("load", () => setTimeout(attach, 300), { once: true });
    }

    return () => {
      // optional cleanup: remove the script on unmount (usually not needed)
      // const s = document.querySelector('script[src*="embed.tawk.to"]');
      // if (s) s.remove();
    };
  }, []);
}
