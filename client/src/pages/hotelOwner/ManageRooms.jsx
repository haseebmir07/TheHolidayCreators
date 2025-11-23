// client/src/pages/owner/ManageRooms.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export default function ManageRooms() {
  const { hotelId } = useParams();
  const { axios, getToken } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/owner/hotels/${hotelId}/rooms`, { headers: { Authorization: `Bearer ${await getToken()}` }});
      if (data.success) setRooms(data.rooms);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchHotel = async () => {
    try {
      const { data } = await axios.get(`/api/hotels`); // public list
      if (data.success) {
        const found = data.hotels.find(h => h._id === hotelId);
        setHotel(found || null);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchRooms();
    fetchHotel();
    // eslint-disable-next-line
  }, [hotelId]);

  const deleteRoom = async (id) => {
    if (!confirm("Delete room?")) return;
    try {
      const { data } = await axios.delete(`/api/owner/rooms/${id}`, { headers: { Authorization: `Bearer ${await getToken()}` }});
      if (data.success) setRooms(r => r.filter(x => x._id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">{hotel?.name || "Hotel"} — Rooms</h2>
          <div className="text-sm text-gray-500">{hotel?.city}</div>
        </div>
        <div>
          <button onClick={() => navigate("/owner/manage-hotels")} className="px-3 py-1 border rounded mr-2">Back</button>
          <button onClick={() => {
            const room = prompt("Room type (e.g. Double Bed)");
            const price = prompt("Price per night");
            if (!room || !price) return;
            (async () => {
              try {
                const { data } = await axios.post(`/api/owner/hotels/${hotelId}/rooms`, {
                  roomType: room,
                  pricePerNight: Number(price),
                  amenities: []
                }, { headers: { Authorization: `Bearer ${await getToken()}` }});
                if (data.success) setRooms(r => [data.room, ...r]);
              } catch (e) { console.error(e) }
            })();
          }} className="bg-indigo-600 text-white px-3 py-1 rounded">Add Room</button>
        </div>
      </div>

      {loading ? <p>Loading rooms…</p> : (
        <div className="space-y-3">
          {rooms.length === 0 ? <p>No rooms yet.</p> : rooms.map(r => (
            <div key={r._id} className="border p-3 rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{r.roomType}</div>
                <div className="text-sm text-gray-500">{r.amenities?.join(", ")}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  const newType = prompt("Room type", r.roomType);
                  const newPrice = prompt("Price", r.pricePerNight);
                  if (!newType || !newPrice) return;
                  (async () => {
                    try {
                      const { data } = await axios.put(`/api/owner/rooms/${r._id}`, { roomType: newType, pricePerNight: Number(newPrice) }, { headers: { Authorization: `Bearer ${await getToken()}` }});
                      if (data.success) setRooms(prev => prev.map(x => x._id === r._id ? data.room : x));
                    } catch (e) { console.error(e) }
                  })();
                }} className="px-3 py-1 border rounded">Edit</button>
                <button onClick={() => deleteRoom(r._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
