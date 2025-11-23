import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

const AdminHotels = () => {
  const { axios, getToken, toast } = useAppContext();

  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const [openHotelId, setOpenHotelId] = useState(null);
  const [roomsByHotel, setRoomsByHotel] = useState({}); // { [hotelId]: { loading, rooms } }

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomDraft, setRoomDraft] = useState(null);

  const [addingHotelId, setAddingHotelId] = useState(null);
  const [newRoomDraft, setNewRoomDraft] = useState({
    roomType: "",
    pricePerNight: "",
    amenitiesText: "",
    isAvailable: true,
  });

  // --------- load hotels ----------
  const loadHotels = async () => {
    try {
      setLoadingHotels(true);
      const { data } = await axios.get("/api/admin/hotels", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setHotels(data.hotels || []);
      } else {
        toast.error(data.message || "Failed to load hotels");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load hotels");
    } finally {
      setLoadingHotels(false);
    }
  };

  // --------- load rooms for hotel ----------
  const loadRoomsForHotel = async (hotelId) => {
    try {
      setRoomsByHotel((prev) => ({
        ...prev,
        [hotelId]: { ...(prev[hotelId] || {}), loading: true },
      }));

      const { data } = await axios.get(`/api/admin/hotels/${hotelId}/rooms`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setRoomsByHotel((prev) => ({
          ...prev,
          [hotelId]: {
            loading: false,
            rooms: data.rooms || [],
          },
        }));
      } else {
        toast.error(data.message || "Failed to load rooms");
        setRoomsByHotel((prev) => ({
          ...prev,
          [hotelId]: { loading: false, rooms: [] },
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load rooms");
      setRoomsByHotel((prev) => ({
        ...prev,
        [hotelId]: { loading: false, rooms: [] },
      }));
    }
  };

  // --------- delete hotel ----------
  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm("Delete this hotel and all its rooms & bookings?")) return;
    try {
      const { data } = await axios.delete(`/api/admin/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success(data.message || "Hotel deleted");
        setHotels((prev) => prev.filter((h) => h._id !== hotelId));
        setRoomsByHotel((prev) => {
          const copy = { ...prev };
          delete copy[hotelId];
          return copy;
        });
      } else {
        toast.error(data.message || "Failed to delete hotel");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete hotel");
    }
  };

  // --------- open/close hotel rooms ----------
  const toggleHotelOpen = (hotelId) => {
    if (openHotelId === hotelId) {
      setOpenHotelId(null);
      return;
    }
    setOpenHotelId(hotelId);
    if (!roomsByHotel[hotelId]?.rooms) {
      loadRoomsForHotel(hotelId);
    }
  };

  // --------- start editing room ----------
  const startEditRoom = (room, hotelId) => {
    setEditingRoomId(room._id);
    setRoomDraft({
      _id: room._id,
      hotelId,
      roomType: room.roomType || "",
      pricePerNight: room.pricePerNight ?? "",
      isAvailable: room.isAvailable ?? true,
      amenitiesText: (room.amenities || []).join(", "),
    });
  };

  const cancelEditRoom = () => {
    setEditingRoomId(null);
    setRoomDraft(null);
  };

  // --------- save room edit ----------
  const saveRoomEdit = async () => {
    if (!roomDraft) return;

    const { _id: roomId, hotelId } = roomDraft;
    const payload = {
      roomType: roomDraft.roomType,
      pricePerNight: Number(roomDraft.pricePerNight) || 0,
      isAvailable: !!roomDraft.isAvailable,
      amenities: roomDraft.amenitiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const { data } = await axios.put(`/api/admin/rooms/${roomId}`, payload, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success("Room updated");
        setEditingRoomId(null);
        setRoomDraft(null);
        loadRoomsForHotel(hotelId);
      } else {
        toast.error(data.message || "Failed to update room");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update room");
    }
  };

  // --------- delete room ----------
  const handleDeleteRoom = async (roomId, hotelId) => {
    if (!window.confirm("Delete this room and its bookings?")) return;
    try {
      const { data } = await axios.delete(`/api/admin/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success(data.message || "Room deleted");
        loadRoomsForHotel(hotelId);
      } else {
        toast.error(data.message || "Failed to delete room");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete room");
    }
  };

  // --------- start add room ----------
  const startAddRoom = (hotelId) => {
    setAddingHotelId(hotelId);
    setNewRoomDraft({
      roomType: "",
      pricePerNight: "",
      amenitiesText: "",
      isAvailable: true,
    });
  };

  const cancelAddRoom = () => {
    setAddingHotelId(null);
    setNewRoomDraft({
      roomType: "",
      pricePerNight: "",
      amenitiesText: "",
      isAvailable: true,
    });
  };

  const saveNewRoom = async () => {
    if (!addingHotelId) return;
    if (!newRoomDraft.roomType || !newRoomDraft.pricePerNight) {
      toast.error("Room type and price are required");
      return;
    }

    const payload = {
      hotelId: addingHotelId,
      roomType: newRoomDraft.roomType,
      pricePerNight: Number(newRoomDraft.pricePerNight) || 0,
      isAvailable: !!newRoomDraft.isAvailable,
      amenities: newRoomDraft.amenitiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      // images: [] // keep images unchanged or add later via cloudinary
    };

    try {
      const { data } = await axios.post("/api/admin/rooms", payload, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        toast.success("Room created");
        cancelAddRoom();
        loadRoomsForHotel(addingHotelId);
      } else {
        toast.error(data.message || "Failed to create room");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create room");
    }
  };

  useEffect(() => {
    loadHotels();
    // eslint-disable-next-line
  }, []);

  // --------- render helpers ----------
  const renderRooms = (hotelId) => {
    const state = roomsByHotel[hotelId];
    if (!state || state.loading) {
      return <p className="text-xs text-slate-500 px-2 py-2">Loading rooms…</p>;
    }
    const rooms = state.rooms || [];
    if (!rooms.length && addingHotelId !== hotelId) {
      return (
        <div className="px-2 py-2 text-xs text-slate-500">
          No rooms for this hotel yet.
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {rooms.map((room) => (
          <div
            key={room._id}
            className="border border-slate-100 rounded-xl px-3 py-2 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
          >
            {/* display or edit mode */}
            {editingRoomId === room._id && roomDraft ? (
              <div className="flex-1 space-y-1 text-xs md:text-sm text-slate-700">
                <div className="flex flex-wrap gap-2">
                  <div>
                    <p className="text-[11px] uppercase text-slate-400">Room Type</p>
                    <input
                      type="text"
                      value={roomDraft.roomType}
                      onChange={(e) =>
                        setRoomDraft((prev) => ({ ...prev, roomType: e.target.value }))
                      }
                      className="border border-slate-200 rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase text-slate-400">Price / night</p>
                    <input
                      type="number"
                      value={roomDraft.pricePerNight}
                      onChange={(e) =>
                        setRoomDraft((prev) => ({
                          ...prev,
                          pricePerNight: e.target.value,
                        }))
                      }
                      className="border border-slate-200 rounded px-2 py-1 text-xs w-24"
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-4">
                    <input
                      id={`avail-${room._id}`}
                      type="checkbox"
                      checked={roomDraft.isAvailable}
                      onChange={(e) =>
                        setRoomDraft((prev) => ({
                          ...prev,
                          isAvailable: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor={`avail-${room._id}`}
                      className="text-xs text-slate-600"
                    >
                      Available
                    </label>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase text-slate-400">Amenities</p>
                  <input
                    type="text"
                    value={roomDraft.amenitiesText}
                    onChange={(e) =>
                      setRoomDraft((prev) => ({
                        ...prev,
                        amenitiesText: e.target.value,
                      }))
                    }
                    placeholder="wifi, breakfast, pool..."
                    className="border border-slate-200 rounded px-2 py-1 text-xs w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 text-xs md:text-sm">
                <p className="font-medium text-slate-900">
                  {room.roomType || "Room"} • ₹{room.pricePerNight ?? 0}/night
                </p>
                <p className="text-[11px] text-slate-500">
                  {room.isAvailable ? "Available" : "Not available"}
                </p>
                {room.amenities && room.amenities.length > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Amenities: {room.amenities.join(", ")}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              {editingRoomId === room._id ? (
                <>
                  <button
                    type="button"
                    onClick={saveRoomEdit}
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-medium"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditRoom}
                    className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => startEditRoom(room, hotelId)}
                    className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRoom(room._id, hotelId)}
                    className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-medium"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Add-room form for this hotel */}
        {addingHotelId === hotelId && (
          <div className="border border-dashed border-slate-300 rounded-xl px-3 py-3 bg-white space-y-2 text-xs md:text-sm">
            <p className="font-medium text-slate-800">Add new room</p>
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-[11px] uppercase text-slate-400">Room Type</p>
                <input
                  type="text"
                  value={newRoomDraft.roomType}
                  onChange={(e) =>
                    setNewRoomDraft((prev) => ({
                      ...prev,
                      roomType: e.target.value,
                    }))
                  }
                  className="border border-slate-200 rounded px-2 py-1 text-xs"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-400">Price / night</p>
                <input
                  type="number"
                  value={newRoomDraft.pricePerNight}
                  onChange={(e) =>
                    setNewRoomDraft((prev) => ({
                      ...prev,
                      pricePerNight: e.target.value,
                    }))
                  }
                  className="border border-slate-200 rounded px-2 py-1 text-xs w-24"
                />
              </div>
              <div className="flex items-center gap-1 mt-4">
                <input
                  id={`new-avail-${hotelId}`}
                  type="checkbox"
                  checked={newRoomDraft.isAvailable}
                  onChange={(e) =>
                    setNewRoomDraft((prev) => ({
                      ...prev,
                      isAvailable: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor={`new-avail-${hotelId}`}
                  className="text-xs text-slate-600"
                >
                  Available
                </label>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase text-slate-400">Amenities</p>
              <input
                type="text"
                value={newRoomDraft.amenitiesText}
                onChange={(e) =>
                  setNewRoomDraft((prev) => ({
                    ...prev,
                    amenitiesText: e.target.value,
                  }))
                }
                placeholder="wifi, breakfast, pool..."
                className="border border-slate-200 rounded px-2 py-1 text-xs w-full"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={saveNewRoom}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-medium"
              >
                Save room
              </button>
              <button
                type="button"
                onClick={cancelAddRoom}
                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Button to open add-room form */}
        {addingHotelId !== hotelId && (
          <button
            type="button"
            onClick={() => startAddRoom(hotelId)}
            className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium"
          >
            + Add Room
          </button>
        )}
      </div>
    );
  };

  // --------- render main ---------
  if (loadingHotels) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Hotels Management</h2>
        <p className="text-sm text-slate-500">Loading hotels…</p>
      </div>
    );
  }

  if (!hotels.length) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Hotels Management</h2>
        <p className="text-sm text-slate-500">No hotels found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
            Hotels Management
          </h2>
          <p className="text-sm text-slate-500">
            View and manage all hotels and their rooms across the platform.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {hotels.map((hotel) => {
          const isOpen = openHotelId === hotel._id;
          return (
            <div
              key={hotel._id}
              className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleHotelOpen(hotel._id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {hotel.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {hotel.city || hotel.address || "—"} • Owner:{" "}
                      {hotel.owner?.username || "—"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHotel(hotel._id);
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-medium"
                >
                  Delete Hotel
                </button>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mt-2 mb-1">
                    Rooms in this hotel:
                  </p>
                  {renderRooms(hotel._id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHotels;
