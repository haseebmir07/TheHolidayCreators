import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import Title from "../../components/Title";
import toast from "react-hot-toast";
import OffersEditor from "../../components/OffersEditor";
/**
 * AdminHotels.jsx — combined admin hotels + rooms UI
 * - supports add room (description + whatThisPlaceOffers + images)
 * - supports edit room including marking existing images for removal and adding new images
 * - uses multipart hotel-scoped endpoints where possible, with JSON fallback
 */

const AdminHotels = () => {
  const { axios, getToken } = useAppContext();

  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [expandedHotelId, setExpandedHotelId] = useState(null);
  const [roomsByHotel, setRoomsByHotel] = useState({});

  // add room
  const [addingHotelId, setAddingHotelId] = useState(null);
  const [newRoomDraft, setNewRoomDraft] = useState({
    roomType: "",
    pricePerNight: "",
    amenitiesText: "",
    isAvailable: true,
    description: "",
    whatThisPlaceOffers: [],
    images: { 1: null, 2: null, 3: null, 4: null },
  });
  const [savingNewRoom, setSavingNewRoom] = useState(false);

  // edit room
  const [editing, setEditing] = useState({ hotelId: null, roomId: null, draft: null, loading: false });

  useEffect(() => {
    (async () => {
      setLoadingHotels(true);
      try {
        const token = await getToken();
        const { data } = await axios.get("/api/admin/hotels", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data?.success) setHotels(data.hotels || []);
        else toast.error(data?.message || "Failed to load hotels");
      } catch (err) {
        console.error("load hotels", err);
        toast.error("Failed to load hotels");
      } finally {
        setLoadingHotels(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  // upload helper for fallback (uploads images to post /rooms/:roomId/images)
  const uploadRoomImages = async (roomId, filesObj = {}, token) => {
    const files = Object.values(filesObj).filter(Boolean);
    if (!files.length) return { success: true };

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    try {
      const { data } = await axios.post(`/api/admin/rooms/${roomId}/images`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (err) {
      console.error("uploadRoomImages error:", err?.response || err.message);
      throw err;
    }
  };

  const loadRoomsForHotel = async (hotelId) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/admin/hotels/${hotelId}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success) setRoomsByHotel((p) => ({ ...p, [hotelId]: data.rooms || [] }));
      else toast.error(data?.message || "Failed to load rooms");
    } catch (err) {
      console.error("load rooms", err);
      toast.error("Failed to load rooms");
    }
  };

  const toggleHotel = async (hotelId) => {
    if (expandedHotelId === hotelId) {
      setExpandedHotelId(null);
      return;
    }
    setExpandedHotelId(hotelId);
    if (!roomsByHotel[hotelId]) await loadRoomsForHotel(hotelId);
  };

  // --- ADD ROOM ---
  const startAddRoom = (hotelId) => {
    setAddingHotelId(hotelId);
    setNewRoomDraft({
      roomType: "",
      pricePerNight: "",
      amenitiesText: "",
      isAvailable: true,
      description: "",
      whatThisPlaceOffers: [],
      images: { 1: null, 2: null, 3: null, 4: null },
    });
  };
  const cancelAddRoom = () => setAddingHotelId(null);

  const adminOnFileChange = (key, file) => setNewRoomDraft((p) => ({ ...p, images: { ...(p.images || {}), [key]: file } }));

  const saveNewRoom = async () => {
    if (!addingHotelId) {
      toast.error("No hotel selected");
      return;
    }
    if (!newRoomDraft.roomType || !newRoomDraft.pricePerNight) {
      toast.error("Room type and price are required");
      return;
    }

    setSavingNewRoom(true);
    try {
      const token = await getToken();
      const tryHotelUrl = `/api/admin/hotels/${addingHotelId}/rooms`;
      const fallbackUrl = `/api/admin/rooms`;
      const formData = new FormData();
      formData.append("hotelId", addingHotelId);
      formData.append("roomType", newRoomDraft.roomType);
      formData.append("pricePerNight", Number(newRoomDraft.pricePerNight) || 0);
      formData.append("isAvailable", newRoomDraft.isAvailable ? "true" : "false");
      formData.append("description", newRoomDraft.description || "");
      formData.append("whatThisPlaceOffers", JSON.stringify(newRoomDraft.whatThisPlaceOffers || []));
      const amenities = newRoomDraft.amenitiesText.split(",").map((s) => s.trim()).filter(Boolean);
      formData.append("amenities", JSON.stringify(amenities));
      Object.keys(newRoomDraft.images).forEach((k) => {
        const file = newRoomDraft.images[k];
        if (file) formData.append("images", file);
      });

      try {
        const { data } = await axios.post(tryHotelUrl, formData, { headers: { Authorization: `Bearer ${token}` } });
        if (data?.success) {
          toast.success("Room created");
          cancelAddRoom();
          await loadRoomsForHotel(addingHotelId);
          return;
        }
        toast.error(data?.message || "Failed to create room (hotel route)");
        return;
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          // fallback JSON create
          const payload = {
            hotelId: addingHotelId,
            roomType: newRoomDraft.roomType,
            pricePerNight: Number(newRoomDraft.pricePerNight) || 0,
            isAvailable: !!newRoomDraft.isAvailable,
            description: newRoomDraft.description || "",
            whatThisPlaceOffers: newRoomDraft.whatThisPlaceOffers || [],
            amenities,
          };
          const { data: createData } = await axios.post(fallbackUrl, payload, { headers: { Authorization: `Bearer ${token}` } });
          if (!createData?.success || !createData?.room?._id) {
            toast.error(createData?.message || "Failed to create room (fallback)");
            return;
          }
          const roomId = createData.room._id;
          const uploadResult = await uploadRoomImages(roomId, newRoomDraft.images, token);
          if (uploadResult?.success) {
            toast.success("Room created and images uploaded");
            cancelAddRoom();
            await loadRoomsForHotel(addingHotelId);
            return;
          } else {
            toast.error(uploadResult?.message || "Room created but image upload failed");
            cancelAddRoom();
            await loadRoomsForHotel(addingHotelId);
            return;
          }
        } else {
          console.error("saveNewRoom unexpected error:", err.response?.data || err.message);
          toast.error(err.message || "Server error");
          return;
        }
      }
    } catch (outerErr) {
      console.error("saveNewRoom outer error:", outerErr);
      toast.error("Unexpected error");
    } finally {
      setSavingNewRoom(false);
    }
  };

  // --- EDIT ROOM ---
  const startEditRoom = (hotelId, room) => {
    setEditing({
      hotelId,
      roomId: room._id,
      loading: false,
      draft: {
        roomType: room.roomType || "",
        pricePerNight: room.pricePerNight || 0,
        amenitiesText: (room.amenities || []).join(", "),
        isAvailable: !!room.isAvailable,
        description: room.description || "",
        whatThisPlaceOffers: (room.whatThisPlaceOffers || []).map((o) => {
          // if stored as string -> convert to object; if stored as object use its fields
          if (!o) return { title: "", subtitle: "", iconKey: "" };
          if (typeof o === "string") return { title: o, subtitle: "", iconKey: "" };
          return {
            title: (o.title || "").toString(),
            subtitle: (o.subtitle || "").toString(),
            iconKey: (o.iconKey || "").toString(),
          };
        }),
        existingImages: Array.isArray(room.images) ? [...room.images] : [],
        newImages: { 1: null, 2: null, 3: null, 4: null },
        removeImages: [],
      },
    });
  };

  const cancelEdit = () => setEditing({ hotelId: null, roomId: null, draft: null, loading: false });

  const editOnFileChange = (slotKey, file) => setEditing((prev) => ({ ...prev, draft: { ...prev.draft, newImages: { ...(prev.draft.newImages || {}), [slotKey]: file } } }));

  const toggleRemoveExistingImage = (imageUrl) => {
    setEditing((prev) => {
      const draft = { ...prev.draft };
      const exists = draft.removeImages.includes(imageUrl);
      draft.removeImages = exists ? draft.removeImages.filter((u) => u !== imageUrl) : [...draft.removeImages, imageUrl];
      return { ...prev, draft };
    });
  };

  const saveEditedRoom = async () => {
    if (!editing?.hotelId || !editing?.roomId || !editing?.draft) return;
    setEditing((prev) => ({ ...prev, loading: true }));

    try {
      const token = await getToken();
      const { draft, hotelId, roomId } = editing;

      const formData = new FormData();
      formData.append("hotelId", hotelId);
      formData.append("roomType", draft.roomType);
      formData.append("pricePerNight", Number(draft.pricePerNight) || 0);
      formData.append("isAvailable", draft.isAvailable ? "true" : "false");
      formData.append("description", draft.description || "");
      formData.append("whatThisPlaceOffers", JSON.stringify(draft.whatThisPlaceOffers || []));
      const amenities = draft.amenitiesText.split(",").map((s) => s.trim()).filter(Boolean);
      formData.append("amenities", JSON.stringify(amenities));

      if (draft.removeImages && draft.removeImages.length > 0) formData.append("removeImages", JSON.stringify(draft.removeImages));
      Object.keys(draft.newImages || {}).forEach((k) => {
        const file = draft.newImages[k];
        if (file) formData.append("images", file);
      });

      const hotelScopedUrl = `/api/admin/hotels/${hotelId}/rooms/${roomId}`;
      const fallbackUrl = `/api/admin/rooms/${roomId}`;

      try {
        const { data } = await axios.put(hotelScopedUrl, formData, { headers: { Authorization: `Bearer ${token}` } });
        if (data?.success) {
          toast.success("Room updated");
          await loadRoomsForHotel(hotelId);
          cancelEdit();
          return;
        }
        toast.error(data?.message || "Failed to update room (hotel route)");
        return;
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          const { data: fallbackData } = await axios.put(fallbackUrl, formData, { headers: { Authorization: `Bearer ${token}` } });
          if (fallbackData?.success) {
            toast.success("Room updated (fallback)");
            await loadRoomsForHotel(hotelId);
            cancelEdit();
            return;
          } else {
            toast.error(fallbackData?.message || "Failed to update room (fallback)");
            return;
          }
        } else {
          console.error("saveEditedRoom unexpected error:", err.response?.data || err.message);
          toast.error("Server error while updating room");
          return;
        }
      }
    } catch (outerErr) {
      console.error("saveEditedRoom outer error:", outerErr);
      toast.error("Unexpected error");
    } finally {
      setEditing((prev) => ({ ...prev, loading: false }));
    }
  };

  // delete room
  const deleteRoom = async (hotelId, roomId) => {
    if (!window.confirm("Delete this room? This action cannot be undone.")) return;
    try {
      const token = await getToken();
      const { data } = await axios.delete(`/api/admin/hotels/${hotelId}/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success) {
        toast.success("Room deleted");
        await loadRoomsForHotel(hotelId);
      } else {
        toast.error(data?.message || "Failed to delete room");
      }
    } catch (err) {
      console.error("deleteRoom", err);
      toast.error("Failed to delete room");
    }
  };

  // small renderer
  const renderRoomCard = (hotelId, room) => {
    const isEditing = editing.hotelId === hotelId && editing.roomId === room._id;
    return (
      <div key={room._id} className="border rounded p-3 shadow-sm bg-white">
        <div className="flex justify-between">
          <div>
            <div className="font-semibold">{room.roomType}</div>
            <div className="text-xs text-slate-500">₹{room.pricePerNight} / night</div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => startEditRoom(hotelId, room)} className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">Edit</button>
            <button onClick={() => deleteRoom(hotelId, room._id)} className="text-xs px-2 py-1 rounded bg-rose-100 text-rose-700">Delete</button>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          {(room.images || []).slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt={`room-${i}`} className="w-20 h-14 object-cover rounded" />
          ))}
        </div>

        {isEditing && editing.draft && (
          <div className="mt-4 border-t pt-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-slate-600">Room Type</p>
                <input type="text" value={editing.draft.roomType} onChange={(e) => setEditing((prev) => ({ ...prev, draft: { ...prev.draft, roomType: e.target.value } }))} className="border rounded px-2 py-1 text-sm w-full" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Price / night</p>
                <input type="number" value={editing.draft.pricePerNight} onChange={(e) => setEditing((prev) => ({ ...prev, draft: { ...prev.draft, pricePerNight: e.target.value } }))} className="border rounded px-2 py-1 text-sm w-full" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.draft.isAvailable} onChange={(e) => setEditing((prev) => ({ ...prev, draft: { ...prev.draft, isAvailable: e.target.checked } }))} />
                  Available
                </label>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600">Description</p>
              <textarea value={editing.draft.description} onChange={(e) => setEditing((prev) => ({ ...prev, draft: { ...prev.draft, description: e.target.value } }))} className="border rounded px-2 py-1 text-sm w-full min-h-[80px]" />
            </div>

            <div className="mt-2">
              <p className="text-[11px] uppercase text-slate-400">What this place offers</p>
              <OffersEditor
                value={editing.draft.whatThisPlaceOffers}
                onChange={(val) => setEditing((prev) => ({ ...prev, draft: { ...prev.draft, whatThisPlaceOffers: val } }))}
              />
            </div>


            <div>
              <p className="text-xs text-slate-600">Amenities (comma separated)</p>
              <input type="text" value={editing.draft.amenitiesText} onChange={(e) => setEditing((prev) => ({ ...prev, draft: { ...prev.draft, amenitiesText: e.target.value } }))} className="border rounded px-2 py-1 text-sm w-full" />
            </div>

            <div>
              <p className="text-xs text-slate-600 mb-1">Existing images</p>
              <div className="flex gap-2 flex-wrap">
                {(editing.draft.existingImages || []).map((imgUrl) => {
                  const marked = editing.draft.removeImages.includes(imgUrl);
                  return (
                    <div key={imgUrl} className="relative w-24 h-16 border rounded overflow-hidden">
                      <img src={imgUrl} alt="" className={`w-full h-full object-cover ${marked ? "opacity-40" : ""}`} />
                      <button type="button" onClick={() => toggleRemoveExistingImage(imgUrl)} className={`absolute top-1 right-1 text-xs px-2 py-0.5 rounded ${marked ? "bg-green-600 text-white" : "bg-white text-rose-600"}`} title={marked ? "Undo remove" : "Remove image"}>
                        {marked ? "Undo" : "Remove"}
                      </button>
                    </div>
                  );
                })}
                {(!editing.draft.existingImages || editing.draft.existingImages.length === 0) && <div className="text-xs text-slate-400">No existing images</div>}
              </div>
              <p className="text-xs text-slate-400 mt-1">Click remove to mark an image for deletion (it is deleted on save).</p>
            </div>

            <div>
              <p className="text-xs text-slate-600 mb-1">Upload new images (optional)</p>
              <div className="flex gap-2">
                {Object.keys(editing.draft.newImages || {}).map((k) => (
                  <label key={k} className="block">
                    <div className="w-24 h-16 border rounded flex items-center justify-center overflow-hidden bg-slate-50">
                      {editing.draft.newImages[k] ? <img src={URL.createObjectURL(editing.draft.newImages[k])} alt="" className="object-cover w-full h-full" /> : <span className="text-xs text-slate-400">Upload</span>}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => editOnFileChange(k, e.target.files[0])} />
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1">New images will be appended to remaining images. Max 4 uploads recommended.</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={saveEditedRoom} className="px-3 py-1 rounded bg-emerald-500 text-white text-sm" disabled={editing.loading}>{editing.loading ? "Saving..." : "Save changes"}</button>
              <button onClick={cancelEdit} className="px-3 py-1 rounded bg-slate-100 text-slate-700 text-sm" disabled={editing.loading}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <Title title="Admin — Hotels" subTitle="Manage hotels and rooms (create, edit, delete). Image upload supported." align="left" />

      <div className="mt-4 space-y-4">
        {loadingHotels ? <div>Loading hotels...</div> : hotels.length === 0 ? <div className="text-sm text-slate-500">No hotels found.</div> : hotels.map((hotel) => {
          const rooms = roomsByHotel[hotel._id] || [];
          const isExpanded = expandedHotelId === hotel._id;
          return (
            <div key={hotel._id} className="border rounded-md bg-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{hotel.name}</div>
                  <div className="text-xs text-slate-500">{hotel.city || ""}</div>
                </div>
                <div className="flex gap-2 items-center">
                  <button onClick={() => toggleHotel(hotel._id)} className="text-xs px-2 py-1 rounded bg-slate-100">{isExpanded ? "Collapse" : "View rooms"}</button>
                  <button onClick={() => startAddRoom(hotel._id)} className="text-xs px-2 py-1 rounded bg-emerald-500 text-white">Add room</button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 space-y-3">
                  {addingHotelId === hotel._id && (
                    <div className="border p-3 rounded bg-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-[11px] uppercase text-slate-400">Room Type</p>
                          <input type="text" value={newRoomDraft.roomType} onChange={(e) => setNewRoomDraft((p) => ({ ...p, roomType: e.target.value }))} className="border rounded px-2 py-1 text-xs w-full" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase text-slate-400">Price / night</p>
                          <input type="number" value={newRoomDraft.pricePerNight} onChange={(e) => setNewRoomDraft((p) => ({ ...p, pricePerNight: e.target.value }))} className="border rounded px-2 py-1 text-xs w-full" />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={newRoomDraft.isAvailable} onChange={(e) => setNewRoomDraft((p) => ({ ...p, isAvailable: e.target.checked }))} />
                            Available
                          </label>
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-[11px] uppercase text-slate-400">Description</p>
                        <textarea value={newRoomDraft.description} onChange={(e) => setNewRoomDraft((p) => ({ ...p, description: e.target.value }))} className="border rounded px-2 py-1 text-xs w-full min-h-[70px]" />
                      </div>

                      <div>
                        <p className="text-xs text-slate-600">What this place offers</p>
                        <OffersEditor
                          value={newRoomDraft.whatThisPlaceOffers}
                          onChange={(val) => setNewRoomDraft((p) => ({ ...p, whatThisPlaceOffers: val }))}
                        />
                      </div>



                      <div className="mt-2">
                        <p className="text-[11px] uppercase text-slate-400">Amenities</p>
                        <input type="text" value={newRoomDraft.amenitiesText} onChange={(e) => setNewRoomDraft((p) => ({ ...p, amenitiesText: e.target.value }))} placeholder="wifi, breakfast, pool..." className="border rounded px-2 py-1 text-xs w-full" />
                      </div>

                      <div className="mt-2">
                        <p className="text-[11px] uppercase text-slate-400 mb-1">Images (optional)</p>
                        <div className="flex gap-2">
                          {Object.keys(newRoomDraft.images).map((k) => (
                            <label key={k} className="block">
                              <div className="w-24 h-16 border rounded flex items-center justify-center overflow-hidden bg-slate-50">
                                {newRoomDraft.images[k] ? <img src={URL.createObjectURL(newRoomDraft.images[k])} alt="" className="object-cover w-full h-full" /> : <span className="text-xs text-slate-400">Upload</span>}
                              </div>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => adminOnFileChange(k, e.target.files[0])} />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-3">
                        <button onClick={saveNewRoom} className="px-3 py-1 rounded bg-emerald-500 text-white text-sm" disabled={savingNewRoom}>{savingNewRoom ? "Saving..." : "Save room"}</button>
                        <button onClick={cancelAddRoom} className="px-3 py-1 rounded bg-slate-100 text-slate-700 text-sm">Cancel</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rooms.length === 0 ? <div className="text-sm text-slate-500">No rooms found for this hotel.</div> : rooms.map((room) => renderRoomCard(hotel._id, room))}
                  </div>
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
