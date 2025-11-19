import React, { useEffect, useState } from "react";
import { assets } from "../../assets/assets";
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
  });

  // load owner's hotels
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
        setLoadingHotels(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const toggleAmenity = (amenity) => {
    setInputs((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [amenity]: !prev.amenities[amenity] },
    }));
  };

  const onFileChange = (key, file) => {
    setImages((prev) => ({ ...prev, [key]: file }));
  };

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

    // require at least one image
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

      Object.keys(images).forEach((key) => {
        if (images[key]) formData.append("images", images[key]);
      });

      // POST to owner endpoint so the room belongs to the chosen hotel
      const { data } = await axios.post(
        `/api/owner/hotels/${selectedHotel}/rooms`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // let axios set Content-Type (multipart boundary)
          },
        }
      );

      if (data.success) {
        toast.success("Room added successfully");
        // redirect to manage rooms for that hotel
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
    <form onSubmit={onSubmitHandler} className="max-w-3xl p-6">
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in the details carefully and accurate room details, pricing, and amenities, to enhance the user booking experience."
      />

      <div className="mt-6">
        <label className="block mb-2 font-medium">Select Hotel</label>
        {loadingHotels ? (
          <p>Loading hotels...</p>
        ) : hotels.length === 0 ? (
          <div className="p-4 border rounded bg-yellow-50">
            <p className="mb-2">You don't have any hotels yet. Create a hotel first to add rooms.</p>
            <button
              type="button"
              onClick={() => window.location.assign("/owner/manage-hotels")}
              className="px-3 py-1 bg-indigo-600 text-white rounded"
            >
              Create Hotel
            </button>
          </div>
        ) : (
          <select
            value={selectedHotel}
            onChange={(e) => setSelectedHotel(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- Select Hotel --</option>
            {hotels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} {h.city ? `— ${h.city}` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Images */}
      <p className="text-gray-800 mt-6">Images</p>
      <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
        {Object.keys(images).map((key) => (
          <label key={key} htmlFor={`roomImage${key}`}>
            <img
              className="max-h-13 cursor-pointer opacity-80"
              src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
              alt=""
            />
            <input
              type="file"
              accept="image/*"
              id={`roomImage${key}`}
              hidden
              onChange={(e) => onFileChange(key, e.target.files[0])}
            />
          </label>
        ))}
      </div>

      <div className="w-full flex max-sm:flex-col sm:gap-4 mt-4">
        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4">Room Type</p>
          <select
            className="border opacity-70 border-gray-300 mt-1 rounded p-2 w-full"
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div>
          <p className="mt-4 text-gray-800">
            Price <span className="text-xs">/night</span>
          </p>
          <input
            type="number"
            placeholder="0"
            className="border border-gray-300 mt-1 rounded p-2 w-24"
            value={inputs.pricePerNight}
            onChange={(e) => setInputs({ ...inputs, pricePerNight: e.target.value })}
            min="0"
          />
        </div>
      </div>

      <p className="text-gray-800 mt-4">Amenities</p>
      <div className="flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm">
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div key={index}>
            <input
              type="checkbox"
              id={`amenities${index + 1}`}
              checked={inputs.amenities[amenity]}
              onChange={() => toggleAmenity(amenity)}
            />
            <label htmlFor={`amenities${index + 1}`}> {amenity} </label>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={inputs.isAvailable}
            onChange={() => setInputs((p) => ({ ...p, isAvailable: !p.isAvailable }))}
          />
          <span className="text-sm"> Available</span>
        </label>
      </div>

      <button className="bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer" disabled={loading}>
        {loading ? "Adding..." : "Add Room"}
      </button>
    </form>
  );
};

export default AddRoom;
