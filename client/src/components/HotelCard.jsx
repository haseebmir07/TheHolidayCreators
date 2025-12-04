import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import LazyImage from "./LazyImage";

/**
 * HotelCard.jsx
 * - Fixed card height + full title visible
 * - Smooth slider with CSS translate3d + cubic-bezier timing
 * - Touch / pointer swipe support
 * - Autoplay with pause on hover / drag
 * - NOW WITH LAZYIMAGE FOR PERFORMANCE
 */

const HotelCard = ({ room }) => {
  const { currency } = useAppContext();

  const images = (room?.images && room.images.length > 0) ? room.images : [assets.placeholderImage];
  const hotelName = room?.hotel?.name || room?.name || "Hotel Name";
  const hotelLocation = room?.hotel?.city || room?.hotel?.address || "Location";
  const price = room?.pricePerNight ?? room?.totalPrice ?? 0;
  const rating = room?.rating ?? 4.9;
  const fullPrice = price + 3000;

  const length = images.length;
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // for pointer/touch dragging
  const containerRef = useRef(null);
  const drag = useRef({
    startX: 0,
    currentX: 0,
    deltaX: 0,
    dragging: false,
    startIndex: 0,
  });

  // autoplay
  useEffect(() => {
    if (isPaused || isDragging || length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, 3000);
    return () => clearInterval(id);
  }, [isPaused, isDragging, length]);

  // move helpers
  const goTo = (i) => setIndex(((i % length) + length) % length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // pointer / touch handlers
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      drag.current.dragging = true;
      drag.current.startX = (e.touches ? e.touches[0].clientX : e.clientX);
      drag.current.currentX = drag.current.startX;
      drag.current.startIndex = index;
      setIsDragging(true);
      setIsPaused(true);
    };

    const onPointerMove = (e) => {
      if (!drag.current.dragging) return;
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
      drag.current.currentX = clientX;
      drag.current.deltaX = clientX - drag.current.startX;

      // direct transform update for smoother dragging
      const track = el.querySelector(".hotel-track");
      if (track) {
        const width = el.clientWidth;
        const offsetPercent = (drag.current.deltaX / width) * 100;
        track.style.transition = "none";
        track.style.transform = `translate3d(${-(drag.current.startIndex * (100 / length)) + offsetPercent}%, 0, 0)`;
      }
    };

    const onPointerUp = () => {
      if (!drag.current.dragging) return;
      drag.current.dragging = false;
      setIsDragging(false);

      const delta = drag.current.deltaX;
      const threshold = Math.max(20, el.clientWidth * 0.12);

      const track = el.querySelector(".hotel-track");
      if (track) track.style.transition = "transform 600ms cubic-bezier(.22,.9,.33,1)";

      if (delta > threshold) prev();
      else if (delta < -threshold) next();
      else goTo(drag.current.startIndex);

      drag.current.deltaX = 0;
      setTimeout(() => setIsPaused(false), 150);
    };

    // touch
    el.addEventListener("touchstart", onPointerDown, { passive: true });
    el.addEventListener("touchmove", onPointerMove, { passive: true });
    el.addEventListener("touchend", onPointerUp);

    // mouse
    el.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    return () => {
      el.removeEventListener("touchstart", onPointerDown);
      el.removeEventListener("touchmove", onPointerMove);
      el.removeEventListener("touchend", onPointerUp);
      el.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
    };
  }, [index, length]);

  const trackStyle = {
    display: "flex",
    height: "100%",
    width: `${100 * length}%`,
    transform: `translate3d(-${(100 / length) * index}%, 0, 0)`,
    transition: isDragging ? "none" : "transform 600ms cubic-bezier(.22,.9,.33,1)",
    willChange: "transform",
  };

  return (
    <Link
      to={"/rooms/" + room._id}
      className="hotel-card"
      style={{
        width: "100%",
        maxWidth: 360,
        height: 390,
        borderRadius: 10,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      {/* slider container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          height: 180,
          width: "100%",
          position: "relative",
          overflow: "hidden",
          touchAction: "pan-y",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        {/* ⭐ LazyImage used here */}
        <div className="hotel-track" style={trackStyle}>
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${hotelName} ${i + 1}`}
              draggable="false"
              style={{
                width: `${100 / length}%`,
                height: "100%",
                objectFit: "cover",
                display: "block",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* controls */}
        {length > 1 && (
          <>
            <button
              aria-label="Previous"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
              style={ctrlBtnLeft}
            >
              ‹
            </button>

            <button
              aria-label="Next"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
              style={ctrlBtnRight}
            >
              ›
            </button>

            <div style={dotsWrap}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
                  aria-label={`Go to ${i + 1}`}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 8,
                    border: "none",
                    padding: 0,
                    margin: 0,
                    cursor: "pointer",
                    background: i === index ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.08) inset"
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* body */}
      <div style={{ flex: 1, padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, fontFamily: "'Poppins', sans-serif", color: "#111", marginBottom: 6, lineHeight: 1.25 }}>
            {hotelName}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 13 }}>
            <img src={assets.locationIcon} alt="loc" style={{ width: 14 }} />
            <span>{hotelLocation}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <img src={assets.starIconFilled} alt="star" style={{ width: 14 }} />
            <span style={{ fontWeight: 700, color: "#f59e0b" }}>{rating}</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {currency}{price} <small style={{ color: "#6b7280" }}>/Person</small>
            </div>
            <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
              Full Price: {currency}{fullPrice}
            </div>
          </div>

          <button
            style={{
              padding: "8px 12px",
              background: "#111",
              color: "#fff",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

/* control button styles */
const ctrlBtnCommon = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(0,0,0,0.45)",
  color: "#fff",
  border: "none",
  width: 34,
  height: 34,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 12,
  cursor: "pointer",
};
const ctrlBtnLeft = { ...ctrlBtnCommon, left: 10 };
const ctrlBtnRight = { ...ctrlBtnCommon, right: 10 };

const dotsWrap = {
  position: "absolute",
  bottom: 8,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 8,
  zIndex: 12
};

export default HotelCard;
