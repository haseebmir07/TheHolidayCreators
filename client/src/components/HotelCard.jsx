// src/components/HotelCard.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

/**
 * HotelCard
 * - shows room/hotel info
 * - image slider
 * - uses dynamic room.fullPrice from DB
 */

const HotelCard = ({ room }) => {
  const { currency } = useAppContext();

  const images =
    room?.images && room.images.length > 0
      ? room.images
      : [assets.placeholderImage];

  const hotelName = room?.hotel?.name || room?.name || "Package";
  const hotelLocation =
    room?.hotel?.city || room?.hotel?.address || "Location";

  // base “current” price (per person / per night)
  const price =
    room?.pricePerNight ??
    room?.pricePerPerson ??
    room?.totalPrice ??
    0;

  // ✅ FULL PRICE FROM DB (admin controlled)
  const fullPrice =
    room?.fullPrice !== undefined &&
    room?.fullPrice !== null &&
    room?.fullPrice !== ""
      ? Number(room.fullPrice)
      : Number(price);

  const rating = room?.rating ?? 4.9;

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef(null);
  const drag = useRef({
    startX: 0,
    currentX: 0,
    deltaX: 0,
    dragging: false,
    startIndex: 0,
  });

  const length = images.length;

  // autoplay
  useEffect(() => {
    if (isPaused || isDragging || length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % length),
      3000
    );
    return () => clearInterval(id);
  }, [isPaused, isDragging, length]);

  const goTo = (i) =>
    setIndex(((i % length) + length) % length);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // pointer/touch events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onDown = (e) => {
      drag.current.dragging = true;
      drag.current.startX = e.touches
        ? e.touches[0].clientX
        : e.clientX;
      drag.current.currentX = drag.current.startX;
      drag.current.deltaX = 0;
      drag.current.startIndex = index;
      setIsDragging(true);
      setIsPaused(true);
    };

    const onMove = (e) => {
      if (!drag.current.dragging) return;
      const clientX = e.touches
        ? e.touches[0].clientX
        : e.clientX;
      drag.current.currentX = clientX;
      drag.current.deltaX =
        clientX - drag.current.startX;

      const track = el.querySelector(".hotel-track");
      if (track) {
        const width = el.clientWidth || 1;
        const offsetPercent =
          (drag.current.deltaX / width) * 100;
        track.style.transition = "none";
        track.style.transform = `translate3d(${
          -(drag.current.startIndex * (100 / length)) +
          offsetPercent
        }%,0,0)`;
      }
    };

    const onUp = () => {
      if (!drag.current.dragging) return;
      drag.current.dragging = false;
      setIsDragging(false);

      const delta = drag.current.deltaX;
      const track = el.querySelector(".hotel-track");
      if (track)
        track.style.transition =
          "transform 600ms cubic-bezier(.22,.9,.33,1)";

      const threshold = Math.max(
        20,
        (el.clientWidth || 1) * 0.12
      );
      if (delta > threshold) prev();
      else if (delta < -threshold) next();
      else goTo(drag.current.startIndex);

      drag.current.deltaX = 0;
      setTimeout(() => setIsPaused(false), 150);
    };

    // touch
    el.addEventListener("touchstart", onDown, {
      passive: true,
    });
    el.addEventListener("touchmove", onMove, {
      passive: true,
    });
    el.addEventListener("touchend", onUp);

    // mouse
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onUp);
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [index, length]);

  const trackStyle = {
    display: "flex",
    height: "100%",
    width: `${100 * length}%`,
    transform: `translate3d(-${
      (100 / length) * index
    }%,0,0)`,
    transition: isDragging
      ? "none"
      : "transform 600ms cubic-bezier(.22,.9,.33,1)",
    willChange: "transform",
  };

  return (
    <Link
      to={`/rooms/${room._id}`}
      className="hotel-card"
      style={{
        width: "100%",
        maxWidth: 360,
        height: 390,
        borderRadius: 10,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      {/* IMAGE SLIDER */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          height: 190,
          width: "100%",
          position: "relative",
          overflow: "hidden",
          touchAction: "pan-y",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
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

        {/* slider controls */}
        {length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prev();
              }}
              style={ctrlBtnLeft}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                next();
              }}
              style={ctrlBtnRight}
            >
              ›
            </button>

            <div style={dotsWrap}>
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goTo(i);
                  }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    border: "none",
                    margin: 0,
                    padding: 0,
                    cursor: "pointer",
                    background:
                      i === index
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.6)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* CARD BODY */}
      <div
        style={{
          flex: 1,
          padding: "10px 14px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {hotelName}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#6b7280",
              fontSize: 13,
            }}
          >
            <img
              src={assets.locationIcon}
              alt=""
              style={{ width: 14, height: 14 }}
            />
            <span>{hotelLocation}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 6,
            }}
          >
            <img
              src={assets.starIconFilled}
              alt=""
              style={{ width: 14, height: 14 }}
            />
            <span
              style={{
                fontWeight: 600,
                color: "#f59e0b",
                fontSize: 13,
              }}
            >
              {rating}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 2,
              }}
            >
              {currency}
              {price}
              <span
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginLeft: 4,
                }}
              >
                / Booking Amount-Person
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#555",
                fontWeight: "bold",
              }}
            >
              Full Price: {currency}
              {fullPrice} / Person
            </div>
          </div>

          <button
            type="button"
            style={{
              padding: "8px 14px",
              background: "#111827",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

/* Controls + dots style */
const ctrlBtnBase = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.45)",
  color: "#fff",
  cursor: "pointer",
  zIndex: 10,
};

const ctrlBtnLeft = { ...ctrlBtnBase, left: 10 };
const ctrlBtnRight = { ...ctrlBtnBase, right: 10 };

const dotsWrap = {
  position: "absolute",
  bottom: 8,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 6,
  zIndex: 10,
};

export default HotelCard;
