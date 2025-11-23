// client/src/pages/owner/ManageHotels.jsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import HotelFormModal from "../../components/HotelFormModal";

export default function ManageHotels() {
  const { axios, getToken } = useAppContext();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/owner/hotels", { headers: { Authorization: `Bearer ${await getToken()}` }});
      if (data.success) setHotels(data.hotels);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this hotel?")) return;
    try {
      const { data } = await axios.delete(`/api/owner/hotels/${id}`, { headers: { Authorization: `Bearer ${await getToken()}` }});
      if (data.success) setHotels(h => h.filter(x => x._id !== id));
    } catch (e) { console.error(e) }
  };

  const openEdit = (hotel) => {
    setEditing(hotel);
    setShowModal(true);
  };

  const onSaved = (newHotel) => {
    setShowModal(false);
    setEditing(null);
    // update or add
    setHotels(h => {
      const idx = h.findIndex(x => x._id === newHotel._id);
      if (idx >= 0) { h[idx] = newHotel; return [...h]; }
      return [newHotel, ...h];
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Manage Hotels</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded">Add Hotel</button>
        </div>
      </div>

      {loading ? <p>Loading…</p> : (
        <>
          {hotels.length === 0 ? <p>No hotels found.</p> : (
            <div className="grid gap-4">
              {hotels.map(h => (
                <div key={h._id} className="border p-4 rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium text-lg">{h.name}</div>
                    <div className="text-sm text-gray-600">{h.city} • {h.address}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/owner/manage-hotels/${h._id}`)} className="px-3 py-1 border rounded">Rooms</button>
                    <button onClick={() => openEdit(h)} className="px-3 py-1 border rounded">Edit</button>
                    <button onClick={() => handleDelete(h._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <HotelFormModal
          editing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
