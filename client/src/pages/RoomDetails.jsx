import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import toast from "react-hot-toast";

/**
 * RoomDetails.jsx
 * - Top: large gallery
 * - Below: two-column content (left scrollable, right sticky booking panel)
 * - "What this place offers" items act like FAQ entries (click title to expand subtitle)
 *
 * NOTE: added top padding so content does not overlap fixed navbar,
 * and increased sticky offset for booking panel so it stays below navbar.
 */

const RoomDetails = () => {
  const { id } = useParams();
  const { facilityIcons, rooms, getToken, axios, navigate } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  const [isAvailable, setIsAvailable] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [billingPhone, setBillingPhone] = useState("");

  // FAQ open state for offers
  const [openOffers, setOpenOffers] = useState(new Set());

  // load room from global rooms cache
  useEffect(() => {
    const r = rooms.find((x) => x._id === id);
    if (r) {
      setRoom(r);
      setMainImage(r.images?.[0] || null);
    }
  }, [rooms, id]);

  useEffect(() => {
    // whenever dates change, reset availability/billing
    setIsAvailable(false);
    setShowBilling(false);
  }, [checkInDate, checkOutDate]);

  const toggleOffer = (index) => {
    setOpenOffers((prev) => {
      const copy = new Set(prev);
      if (copy.has(index)) copy.delete(index);
      else copy.add(index);
      return copy;
    });
  };

  const checkAvailability = async () => {
    try {
      if (!checkInDate || !checkOutDate) {
        toast.error("Select check-in and check-out dates");
        return;
      }
      if (checkInDate >= checkOutDate) {
        toast.error("Check-in must be before check-out");
        return;
      }

      const { data } = await axios.post("/api/bookings/check-availability", {
        room: id,
        checkInDate,
        checkOutDate,
      });

      if (data.success) {
        if (data.isAvailable) {
          setIsAvailable(true);
          setShowBilling(true);
          toast.success("Room is available");
        } else {
          setIsAvailable(false);
          setShowBilling(false);
          toast.error("Room is not available");
        }
      } else {
        toast.error(data.message || "Availability check failed");
      }
    } catch (err) {
      toast.error(err.message || "Server error");
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      if (!isAvailable) {
        return checkAvailability();
      }
      // now booking
      if (!billingName.trim() || !billingPhone.trim()) {
        toast.error("Please enter billing name & phone");
        return;
      }

      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: id,
          checkInDate,
          checkOutDate,
          guests,
          paymentMethod: "Pay At Hotel",
          billingName,
          billingPhone,
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/my-bookings");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Booking failed");
    }
  };

  if (!room) return null;

  const offers = room.whatThisPlaceOffers || [];

  return (
    // Add top padding so content doesn't overlap the fixed navbar.
    // pt-20 for small screens and pt-28 for md+ increase the offset if your navbar is taller.
    <div className="min-h-screen bg-white pt-20 md:pt-16">
      {/* --- TOP: Gallery --- */}
      <div className="max-w-6xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{room.hotel?.name || ""}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* big image on left (spans 2 rows on desktop) */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden shadow">
              <img src={mainImage} alt="main" className="w-full h-[520px] object-cover" />
            </div>

            {/* thumbnails below big image */}
            <div className="flex gap-3 mt-3">
              {room.images?.slice(0, 6).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-16 overflow-hidden rounded border ${mainImage === img ? "ring-2 ring-orange-400" : "border-gray-200"}`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* right side small gallery column for larger screens */}
          <div className="hidden lg:block">
            <div className="grid grid-rows-3 gap-3 h-full">
              {room.images?.slice(1, 7).map((img, idx) => (
                <button key={idx} onClick={() => setMainImage(img)} className="w-full h-[160px] overflow-hidden rounded border border-gray-200">
                  <img src={img} alt={`side-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- BELOW: content + sticky booking panel --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: main content column (spans 2 cols on large screens) */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold">{room.roomType}</h2>
              <div className="flex items-center gap-4 mt-3">
                <StarRating />
                <span className="text-sm text-slate-500">{room.reviewsCount || "200+"} reviews</span>
              </div>
            </div>

            {/* highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">+</div>
                  <div>
                    <div className="font-medium">Clean & Safe Stay</div>
                    <div className="text-slate-500 text-sm">A well-maintained and hygienic space just for you.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl">▲</div>
                  <div>
                    <div className="font-medium">Excellent Location</div>
                    <div className="text-slate-500 text-sm">90% of guests rated the location 5 stars.</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">—</div>
                  <div>
                    <div className="font-medium">Enhanced Cleaning</div>
                    <div className="text-slate-500 text-sm">This host follows enhanced cleaning standards.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-xl">|</div>
                  <div>
                    <div className="font-medium">Smooth Check-In</div>
                    <div className="text-slate-500 text-sm">100% of guests gave check-in a 5-star rating.</div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-t border-gray-200 my-6" />

            {/* WHAT THIS PLACE OFFERS - two column list with FAQ toggle */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">What this place offers</h3>

              {offers.length === 0 ? (
                <div className="text-sm text-slate-500 mb-4">No offerings listed for this room.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {offers.map((o, i) => {
                    // support both string or object
                    const isString = typeof o === "string";
                    const title = isString ? o : (o.title || "");
                    const subtitle = isString ? "" : (o.subtitle || "");
                    const iconKey = isString ? title : (o.iconKey || title);

                    const isOpen = openOffers.has(i);

                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {facilityIcons?.[iconKey] ? (
                              <img src={facilityIcons[iconKey]} alt={title} className="w-5 h-5" />
                            ) : (
                              <span className="inline-block w-2 h-2 bg-slate-400 rounded-full mt-2" />
                            )}
                          </div>

                          <div className="flex-1">
                            {/* Title button */}
                            <button
                              type="button"
                              onClick={() => toggleOffer(i)}
                              aria-expanded={isOpen}
                              className="w-full text-left flex items-center justify-between gap-3"
                            >
                              <div className="text-sm font-semibold text-slate-800">{title}</div>
                              {/* small chevron */}
                              <svg
                                className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                              >
                                <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>

                            {/* Subtitle / collapsible description */}
                            {subtitle ? (
                              <div
                                className={`mt-2 text-xs text-slate-500 overflow-hidden transition-all ${
                                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                                aria-hidden={!isOpen}
                              >
                                {subtitle}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <hr className="border-t border-gray-200 my-6" />

            {/* Description (banner-like) */}
            <div className="mb-6">
              <div className="text-base text-slate-700 leading-7">
                {room.description || "No description provided for this room."}
              </div>
            </div>

            <hr className="border-t border-gray-200 my-6" />

            {/* Host block */}
            <div className="flex items-center gap-4 py-6">
              <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                {room.hotel?.owner?.name?.[0] || "H"}
              </div>
              <div>
                <div className="font-medium">Hosted by {room.hotel?.name}</div>
                <div className="text-sm text-slate-500">200+ reviews</div>
              </div>
            </div>

            {/* spacer to make sure content is long enough to scroll */}
            <div className="h-16" />
          </div>

          {/* RIGHT: sticky booking panel */}
          <div className="lg:col-span-1">
            {/* increased top offset so the panel starts below the navbar on most screen sizes */}
            <div className="sticky top-32 md:top-28">
              <div className="border rounded-lg p-6 shadow-md bg-white">
                <div className="text-2xl font-semibold mb-1">₹{room.pricePerNight}</div>
                <div className="text-sm text-slate-500 mb-3">per night</div>

                <form onSubmit={onSubmitHandler} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Check-in</label>
                    <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full border rounded px-3 py-2" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Check-out</label>
                    <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} min={checkInDate || new Date().toISOString().split("T")[0]} className="w-full border rounded px-3 py-2" />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Guests</label>
                    <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full border rounded px-3 py-2">
                      <option value={1}>1 guest</option>
                      <option value={2}>2 guests</option>
                      <option value={3}>3 guests</option>
                      <option value={4}>4 guests</option>
                    </select>
                  </div>

                  <button type="submit" className="w-full bg-pink-600 hover:opacity-95 text-white rounded py-3 mt-2">
                    {isAvailable ? "Book Now" : "Check availability"}
                  </button>

                  <p className="text-xs text-slate-400 mt-2">You won't be charged yet</p>
                </form>

                {/* billing form (appears after availability confirmed) */}
                {showBilling && (
                  <div className="mt-4">
                    <div className="text-sm font-medium">Billing info</div>
                    <input type="text" placeholder="Full name" value={billingName} onChange={(e) => setBillingName(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" />
                    <input type="tel" placeholder="Phone" value={billingPhone} onChange={(e) => setBillingPhone(e.target.value)} className="w-full border rounded px-3 py-2 mt-2" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer spacer so sticky behaves well */}
        <div className="h-24" />
      </div>
    </div>
  );
};

export default RoomDetails;
