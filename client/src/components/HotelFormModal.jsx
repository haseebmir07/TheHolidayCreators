// client/src/components/HotelFormModal.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

export default function HotelFormModal({ editing, onClose, onSaved }) {
  const { axios, getToken } = useAppContext();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setAddress(editing.address || "");
      setContact(editing.contact || "");
      setCity(editing.city || "");
    } else {
      setName(""); setAddress(""); setContact(""); setCity("");
    }
  }, [editing]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const { data } = await axios.put(`/api/owner/hotels/${editing._id}`, { name, address, contact, city }, { headers: { Authorization: `Bearer ${await getToken()}` }});
        if (data.success) onSaved(data.hotel);
      } else {
        const { data } = await axios.post(`/api/owner/hotels`, { name, address, contact, city }, { headers: { Authorization: `Bearer ${await getToken()}` }});
        if (data.success) onSaved(data.hotel);
      }
    } catch (e) { console.error(e) }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white p-6 rounded w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{editing ? "Edit Hotel" : "Add Hotel"}</h3>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hotel name" className="w-full border px-3 py-2 rounded" required />
          <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact" className="w-full border px-3 py-2 rounded" required />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full border px-3 py-2 rounded" required />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full border px-3 py-2 rounded" required />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
          <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">{editing ? "Save" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}
