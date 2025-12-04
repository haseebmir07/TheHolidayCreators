import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * Robust LazyImage with callback ref
 * - Attach IntersectionObserver only after node is mounted (no race)
 * - Fallback to immediate load when IO not supported
 * - Optional forceLoad prop for debugging (loads immediately)
 * - Shows simple placeholder until image loads
 *
 * Usage:
 * <LazyImage src={url} alt="..." style={{...}} />
 */

export default function LazyImage({
  src,
  alt = "",
  className = "",
  style = {},
  placeholder,    // optional placeholder url (not required)
  forceLoad = false, // set true to bypass observer and load immediately
  rootMargin = "300px",
  ...rest
}) {
  const [visible, setVisible] = useState(Boolean(forceLoad));
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const observerRef = useRef(null);

  // callback ref ensures the DOM node is available when we attach observer
  const wrapperRef = useCallback((node) => {
    // disconnect previous observer if any
    if (observerRef.current) {
      try { observerRef.current.disconnect(); } catch (e) { /* ignore */ }
      observerRef.current = null;
    }

    if (!node) return;

    // If forceLoad or IO not available, set visible immediately
    if (forceLoad || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    // Create observer and observe node
    try {
      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              // disconnect once visible
              if (observerRef.current) {
                try { observerRef.current.disconnect(); } catch (e) { /* ignore */ }
                observerRef.current = null;
              }
              break;
            }
          }
        },
        { root: null, rootMargin }
      );
      obs.observe(node);
      observerRef.current = obs;
    } catch (err) {
      // If anything goes wrong, fallback to visible
      console.warn("LazyImage: IntersectionObserver failed, falling back to immediate load", err);
      setVisible(true);
    }
  }, [forceLoad, rootMargin]);

  // safety: if visible never becomes true (edge case), fallback after timeout
  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => {
      if (!visible) {
        // If we haven't become visible after a while, make it visible (avoids stuck placeholder)
        setVisible(true);
        console.warn("LazyImage: fallback forcing visible after timeout", { src });
      }
    }, 5000); // 5s fallback
    return () => clearTimeout(t);
  }, [visible, src]);

  // reset states when src changes
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    if (forceLoad) setVisible(true);
  }, [src, forceLoad]);

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    ...style,
  };

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}
    >
      {visible ? (
        <>
          <img
            src={src || placeholder || ""}
            alt={alt}
            loading="lazy"
            decoding="async"
            style={{
              ...imgStyle,
              opacity: loaded ? 1 : 0,
              transition: "opacity .35s ease, transform .35s ease",
              transform: loaded ? "translateZ(0)" : "scale(1.02)",
              willChange: "opacity, transform",
            }}
            onLoad={() => {
              setLoaded(true);
              setErrored(false);
            }}
            onError={(e) => {
              setErrored(true);
              console.error("LazyImage failed to load:", src, e);
            }}
            {...rest}
          />

          {/* placeholder layer while loading */}
          {!loaded && !errored && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: "#f3f4f6",
                display: "block",
                filter: "blur(6px)",
              }}
            />
          )}

          {/* error overlay for debugging (shows image URL) */}
          {errored && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.45)",
                color: "#fff",
                padding: 8,
                textAlign: "center",
                zIndex: 40,
                fontSize: 12,
              }}
            >
              <div style={{ marginBottom: 6 }}>Image failed to load</div>
              <div style={{ wordBreak: "break-all", maxWidth: 240 }}>{String(src)}</div>
            </div>
          )}
        </>
      ) : (
        // not visible yet: light placeholder
        <div style={{ width: "100%", height: "100%", background: "#eee" }} />
      )}
    </div>
  );
}
