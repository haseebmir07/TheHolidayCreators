import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const HotelCard = ({ room, index }) => {
  const { currency } = useAppContext();

  const imgSrc = room?.images?.[0] || assets.placeholderImage || "";
  const hotelName = room?.hotel?.name || room?.name || "Hotel";
  const hotelLocation = room?.hotel?.city || room?.hotel?.address || "Unknown location";
  const price = room?.pricePerNight ?? room?.totalPrice ?? 0;
  const rating = room?.rating ?? 4.9;

  return (
    <Link
      to={"/rooms/" + room._id}
      onClick={() => scrollTo(0, 0)}
      className="hotel-card"
    >
      <div className="hotel-image-wrap">
        <img src={imgSrc} alt="hotel-img" className="hotel-image" draggable="false" />
        {index % 2 === 0 && (
          <div className="hotel-badge"></div>
        )}
      </div>

      <div className="hotel-card-body">
        <div className="hotel-title-row">
          <div>
            <div className="hotel-title">{hotelName}</div>
            <div className="hotel-location">
              <img src={assets.locationIcon} alt="loc" style={{ width: 14, height: 14 }} />
              <span>{hotelLocation}</span>
            </div>
          </div>

          <div className="hotel-rating">
            <img src={assets.starIconFilled} alt="star" style={{ width: 14, height: 14 }} />
            <span style={{ fontWeight: 700, color: "#f59e0b" }}>{rating}</span>
          </div>
        </div>

        <div className="hotel-meta">
          <div className="hotel-price">
            {currency}
            {price}
            <small>/Person</small>
          </div>

          <button
            className="hotel-cta"
            onClick={(e) => {
              /* keep the link navigation — prevent double handling */
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
