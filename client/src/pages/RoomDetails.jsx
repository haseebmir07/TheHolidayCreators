// RoomDetails.jsx
import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useParams } from "react-router-dom";
import StarRating from "../components/StarRating";
import toast from "react-hot-toast";

/* -----------------------------------------
   Helper: load Razorpay script dynamically
   ----------------------------------------- */
function loadRazorpayScript(src = "https://checkout.razorpay.com/v1/checkout.js") {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const RoomDetails = () => {
  const { id } = useParams();
  const { facilityIcons, rooms, getToken, axios, navigate, user, currency } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  const [isAvailable, setIsAvailable] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [billingPhone, setBillingPhone] = useState("");

  // customization UI & data
  const [showCustomize, setShowCustomize] = useState(false);
  const [minGuests, setMinGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(500);
  const [minDays, setMinDays] = useState(1);
  const [maxDays, setMaxDays] = useState(90);
  const [includedThings, setIncludedThings] = useState("");
  const [customSaved, setCustomSaved] = useState(false);
  const [customOptions, setCustomOptions] = useState(null);

  // submission / loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      // prevent double submit
      if (isSubmitting) return;

      if (!isAvailable) {
        return checkAvailability();
      }
      // now booking
      if (!billingName.trim() || !billingPhone.trim()) {
        toast.error("Please enter billing name & phone");
        return;
      }

      setIsSubmitting(true);

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
          // attach customization options if present
          customization: customOptions || undefined,
        },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      // ---------- NEW: Razorpay flow after booking creation ----------
      if (data.success) {
        const bookingId = data.bookingId || data.booking?._id || data._id;

        toast.success("Booking created. Opening payment...");

        // Load Razorpay SDK
        const scriptOk = await loadRazorpayScript();
        if (!scriptOk) {
          toast.error("Failed to load payment SDK");
          // still navigate to bookings so user can retry or pay from "My Bookings"
          setIsSubmitting(false);
          return navigate("/my-bookings");
        }

        // create order on server
        const orderResp = await axios.post(
          "/api/bookings/razorpay/order",
          { bookingId },
          { headers: { Authorization: `Bearer ${await getToken()}` } }
        );

        if (!orderResp.data.success) {
          toast.error(orderResp.data.message || "Failed to create payment order");
          setIsSubmitting(false);
          return navigate("/my-bookings");
        }

        const { orderId, amount, currency: orderCurrency, key } = orderResp.data;

        const options = {
          key, // Razorpay key id
          amount, // in smallest currency unit (paise)
          currency: orderCurrency,
          name: "The Holiday Creators",
          description: "Booking payment",
          order_id: orderId,
          handler: async function (response) {
            // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
            try {
              const verifyResp = await axios.post(
                "/api/bookings/razorpay/verify",
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId,
                },
                { headers: { Authorization: `Bearer ${await getToken()}` } }
              );

              if (verifyResp.data.success) {
                toast.success("Payment successful — booking confirmed");
                setIsSubmitting(false);
                navigate("/my-bookings");
              } else {
                toast.error(verifyResp.data.message || "Payment verification failed");
                setIsSubmitting(false);
                navigate("/my-bookings");
              }
            } catch (err) {
              toast.error("Payment verification failed");
              setIsSubmitting(false);
              navigate("/my-bookings");
            }
          },
          prefill: {
            name: billingName || (user && user.username) || "",
            email: (user && user.email) || "",
            contact: billingPhone || "",
          },
          notes: { bookingId },
          theme: { color: "#F72585" },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          console.error("Razorpay payment failed:", resp);
          toast.error("Payment failed or canceled. You can retry from My Bookings.");
          setIsSubmitting(false);
          navigate("/my-bookings");
        });
        rzp.open();
        return;
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch (err) {
      toast.error(err.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) return null;

  const offers = room.whatThisPlaceOffers || [];

  // small spinner SVG (keeps Tailwind styling)
  const Spinner = ({ className = "w-4 h-4 mr-2" }) => (
    <svg className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
    </svg>
  );

  // customization submit
  const handleCustomizeSave = (e) => {
    e.preventDefault();
    // basic validation
    if (minGuests <= 0 || maxGuests <= 0 || minDays <= 0 || maxDays <= 0) {
      toast.error("Values must be positive");
      return;
    }
    if (minGuests > maxGuests) {
      toast.error("Min guests cannot be greater than max guests");
      return;
    }
    if (minDays > maxDays) {
      toast.error("Min days cannot be greater than max days");
      return;
    }

    const opts = {
      guestsRange: { min: Number(minGuests), max: Number(maxGuests) },
      daysRange: { min: Number(minDays), max: Number(maxDays) },
      included: includedThings.trim(),
      savedAt: new Date().toISOString(),
    };

    setCustomOptions(opts);
    setCustomSaved(true);
    setShowCustomize(false);
    toast.success("Customization saved — it will be attached to booking");
  };

  const handleClearCustomization = () => {
    setMinGuests(1);
    setMaxGuests(500);
    setMinDays(1);
    setMaxDays(90);
    setIncludedThings("");
    setCustomOptions(null);
    setCustomSaved(false);
    toast.success("Customization cleared");
  };

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
              <h3 className="text-xl font-semibold mb-4">Day-Wise Itinerary</h3>

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
                <div className="font-medium">Hosted by TheHolidayCreators</div>
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
                {/* ===== Toggle switch for customization (new) ===== */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-700">Customize</div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={showCustomize}
                      onChange={() => setShowCustomize((s) => !s)}
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${showCustomize ? "bg-pink-600" : "bg-gray-200"}`} />
                    <span className="ml-2 text-xs text-slate-500">{showCustomize ? "Open" : "Off"}</span>
                  </label>
                </div>

                {/* customization form - collapsible */}
                <div className={`overflow-hidden transition-all ${showCustomize ? "max-h-[400px] opacity-100 mb-4" : "max-h-0 opacity-0 h-0"}`}>
                  <form onSubmit={handleCustomizeSave} className="space-y-2">
                    <div>
                      <label className="text-xs font-medium block mb-1">Guests (min - max)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={minGuests}
                          onChange={(e) => setMinGuests(e.target.value)}
                          className="w-1/2 border rounded px-3 py-2"
                        />
                        <input
                          type="number"
                          min={1}
                          value={maxGuests}
                          onChange={(e) => setMaxGuests(e.target.value)}
                          className="w-1/2 border rounded px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">Days (min - max)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          value={minDays}
                          onChange={(e) => setMinDays(e.target.value)}
                          className="w-1/2 border rounded px-3 py-2"
                        />
                        <input
                          type="number"
                          min={1}
                          value={maxDays}
                          onChange={(e) => setMaxDays(e.target.value)}
                          className="w-1/2 border rounded px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium block mb-1">Include (things/requests)</label>
                      <textarea
                        value={includedThings}
                        onChange={(e) => setIncludedThings(e.target.value)}
                        placeholder="itinerary changes eg. Add 2N stay at desired location."
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 bg-pink-600 text-white rounded py-2">
                        Save customization
                      </button>
                      <button type="button" onClick={handleClearCustomization} className="flex-1 border rounded py-2">
                        Clear
                      </button>
                    </div>
                  </form>
                </div>

                <div className="text-2xl font-semibold mb-1">{currency}{room.pricePerNight}</div>
                <div className="text-sm text-slate-500 mb-3">/Person</div>

                <form onSubmit={onSubmitHandler} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Check-in</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      min={checkInDate || new Date().toISOString().split("T")[0]}
                      className="w-full border rounded px-3 py-2"
                      disabled={isSubmitting}
                    />
                  </div>

                <div>
  <label className="text-xs font-medium block mb-1">Guests</label>

  <div className="flex items-center gap-2 border rounded px-3 py-2 w-full">
    {/* Decrease Button */}
    <button
      type="button"
      onClick={() => setGuests(prev => Math.max(1, prev - 1))}
      disabled={isSubmitting}
      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
    >
      −
    </button>

    {/* Display Guest Count */}
    <span className="flex-1 text-center">{guests} guest{guests > 1 ? "s" : ""}</span>

    {/* Increase Button */}
    <button
      type="button"
      onClick={() => setGuests(prev => Math.min(500, prev + 1))}
      disabled={isSubmitting}
      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
    >
      +
    </button>
  </div>
</div>


                  <button
                    type="submit"
                    className={`w-full ${isSubmitting ? "bg-pink-700 cursor-not-allowed" : "bg-pink-600 hover:opacity-95"} text-white rounded py-3 mt-2 inline-flex items-center justify-center`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner />
                        <span>{isAvailable ? "Booking..." : "Checking..."}</span>
                      </>
                    ) : (
                      <span>{isAvailable ? "Book Now" : "Check availability"}</span>
                    )}
                  </button>

                  <p className="text-xs text-slate-400 mt-2">You won't be charged yet</p>
                </form>

                {/* show small customization summary if saved */}
                {customSaved && customOptions && (
                  <div className="mt-4 border-t pt-3 text-sm text-slate-700">
                    <div className="font-medium mb-1">Customization saved</div>
                    <div>Guests: {customOptions.guestsRange.min} - {customOptions.guestsRange.max}</div>
                    <div>Days: {customOptions.daysRange.min} - {customOptions.daysRange.max}</div>
                    {customOptions.included ? <div>Include: {customOptions.included}</div> : null}
                    <div className="mt-2">
                      <button onClick={() => { setShowCustomize(true); setCustomSaved(false); }} className="text-xs underline">Edit customization</button>
                      <button onClick={handleClearCustomization} className="ml-3 text-xs text-red-600">Remove</button>
                    </div>
                  </div>
                )}

                {/* billing form (appears after availability confirmed) */}
                {showBilling && (
                  <div className="mt-4">
                    <div className="text-sm font-medium">Billing info</div>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      className="w-full border rounded px-3 py-2 mt-2"
                      disabled={isSubmitting}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={billingPhone}
                      onChange={(e) => setBillingPhone(e.target.value)}
                      className="w-full border rounded px-3 py-2 mt-2"
                      disabled={isSubmitting}
                    />
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
