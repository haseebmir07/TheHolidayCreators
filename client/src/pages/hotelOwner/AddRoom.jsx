import React, { useEffect, useState, useRef } from "react";
import Title from "../../components/Title";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";

const AddRoom = () => {
  const { axios, getToken } = useAppContext();
  const navigate = useNavigate();

  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null });
  const [loading, setLoading] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("");

  const [inputs, setInputs] = useState({
    roomType: "",
    pricePerNight: 0,
    amenities: {
      "Free WiFi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
    isAvailable: true,
    description: "",
    whatThisPlaceOffers: "",
  });

  const lastAutoDescRef = useRef("");

  const generateSuggestedDescription = (roomType, hotelId) => {
    const hotel = hotels.find((h) => h._id === hotelId);
    const hotelName = hotel?.name || "this hotel";
    if (!roomType) return "";
    return `${roomType} at ${hotelName} — comfy, clean, and thoughtfully furnished. Perfect for travellers looking for value and convenience.`;
  };

  useEffect(() => {
    const suggested = generateSuggestedDescription(inputs.roomType, selectedHotel);
    if (!inputs.description || inputs.description === lastAutoDescRef.current) {
      setInputs((prev) => ({ ...prev, description: suggested }));
      lastAutoDescRef.current = suggested;
    }
    // eslint-disable-next-line
  }, [inputs.roomType, selectedHotel, hotels.length]);

  useEffect(() => {
    (async () => {
      setLoadingHotels(true);
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/owner/hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setHotels(data.hotels || []);
          if (data.hotels?.length === 1) setSelectedHotel(data.hotels[0]._id);
        } else {
          toast.error(data.message || "Could not load your hotels");
        }
      } catch (err) {
        console.error("fetch owner hotels:", err);
        toast.error("Failed to load your hotels");
      } finally {
        setLoadingHospitals && setLoadingHotels(false);
        setLoadingHotels(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const toggleAmenity = (key) => {
    setInputs((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: !prev.amenities[key] },
    }));
  };

  const onFileChange = (slot, file) => setImages((prev) => ({ ...prev, [slot]: file }));

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!selectedHotel) {
      toast.error("Please select a hotel to add the room to.");
      return;
    }

    if (!inputs.roomType || !inputs.pricePerNight) {
      toast.error("Please fill in room type and price.");
      return;
    }

    if (!Object.values(images).some((img) => img)) {
      toast.error("Please upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("roomType", inputs.roomType);
      formData.append("pricePerNight", Number(inputs.pricePerNight));
      formData.append("isAvailable", inputs.isAvailable ? "true" : "false");

      const amenitiesArr = Object.keys(inputs.amenities).filter((k) => inputs.amenities[k]);
      formData.append("amenities", JSON.stringify(amenitiesArr));

      formData.append("description", inputs.description || "");
      formData.append("whatThisPlaceOffers", inputs.whatThisPlaceOffers || "");

      Object.keys(images).forEach((key) => {
        if (images[key]) formData.append("images", images[key]);
      });

      const { data } = await axios.post(`/api/owner/hotels/${selectedHotel}/rooms`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Room added successfully");
        navigate(`/owner/manage-hotels/${selectedHotel}`);
      } else {
        toast.error(data.message || "Failed to add room");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="max-w-3xl p-6 mx-auto">
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in accurate room details, pricing, and amenities to enhance the booking experience."
      />

      {/* Hotel select */}
      <div className="mb-3">
        <p className="text-gray-800">Select Hotel</p>
        <select
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
          className="border rounded px-3 py-2 mt-1 w-full"
        >
          <option value="">Choose hotel</option>
          {hotels.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image uploads */}
      <div className="mb-4">
        <p className="text-gray-800">Images</p>
        <div className="flex gap-3 mt-2">
          {Object.keys(images).map((k) => (
            <label key={k} className="block">
              <div className="w-28 h-20 border rounded flex items-center justify-center overflow-hidden bg-slate-50">
                {images[k] ? (
                  <img src={URL.createObjectURL(images[k])} alt="" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-xs text-slate-400">Upload</span>
                )}
              </div>
              <input className="hidden" type="file" accept="image/*" onChange={(e) => onFileChange(k, e.target.files[0])} />
            </label>
          ))}
        </div>
      </div>

      {/* Room Type & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-800">Room Type</p>
          <input
            className="border rounded px-3 py-2 mt-1 w-full"
            value={inputs.roomType}
            onChange={(e) => setInputs((p) => ({ ...p, roomType: e.target.value }))}
            placeholder="Deluxe / Suite / Studio"
          />
        </div>
        <div>
          <p className="text-gray-800">Price per night</p>
          <input
            className="border rounded px-3 py-2 mt-1 w-full"
            type="number"
            value={inputs.pricePerNight}
            onChange={(e) => setInputs((p) => ({ ...p, pricePerNight: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {Object.keys(inputs.amenities).map((a) => (
          <label key={a} className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 cursor-pointer">
            <input type="checkbox" checked={inputs.amenities[a]} onChange={() => toggleAmenity(a)} />
            <span className="text-sm">{a}</span>
          </label>
        ))}
      </div>

      {/* Description */}
      <div className="mt-4">
        <p className="text-gray-800">Description</p>
        <textarea
          className="border border-gray-300 rounded p-2 w-full mt-1 min-h-[90px]"
          placeholder="Write a custom description for this room..."
          value={inputs.description}
          onChange={(e) => {
            lastAutoDescRef.current = "";
            setInputs((prev) => ({ ...prev, description: e.target.value }));
          }}
        />
      </div>

      {/* What this place offers */}
      <div className="mt-4">
        <p className="text-gray-800">What this place offers</p>
        <p className="text-xs text-slate-400 mb-2">Comma-separated. e.g. "Wifi, Kitchen, Mountain view"</p>
        <input
          type="text"
          value={inputs.whatThisPlaceOffers}
          onChange={(e) => setInputs((prev) => ({ ...prev, whatThisPlaceOffers: e.target.value }))}
          placeholder="Wifi, Kitchen, Free parking..."
          className="border border-gray-300 rounded p-2 w-full mt-1"
        />
      </div>

      <button className="bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer" disabled={loading}>
        {loading ? "Adding..." : "Add Room"}
      </button>
    </form>
  );
};

export default AddRoom;
