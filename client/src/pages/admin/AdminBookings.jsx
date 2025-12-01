import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

export default function AdminBookings() {
  const { axios, getToken, toast, currency } = useAppContext();
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await axios.get("/api/admin/bookings", { headers: { Authorization: `Bearer ${await getToken()}` }});
    if (data.success) setRows(data.bookings);
  };

  const markPaid = async (id) => {
    await axios.patch(`/api/admin/bookings/${id}/pay`, {}, { headers: { Authorization: `Bearer ${await getToken()}` }});
    toast.success("Marked Paid");
    load();
  };

  const cancelBooking = async (id) => {
    await axios.patch(`/api/admin/bookings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${await getToken()}` }});
    toast.success("Cancelled");
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bookings Management</h2>

      {rows.map(b => (
        <div key={b._id} className="border p-3 rounded-lg bg-white flex justify-between">
          <div>
            <p className="font-medium">
              {b.hotel?.name} • {b.room?.roomType}
            </p>
            <p className="text-xs text-slate-400">
              {b.user?.username} • {b.billingPhone}
            </p>
          </div>

        <div className="flex gap-2">
  {!b.isPaid && (
    <button
      onClick={() => markPaid(b._id)}
      className="px-3 py-1 bg-green-500 text-white rounded text-sm"
    >
      Mark Paid
    </button>
  )}

  {b.status !== "cancelled" && (
    <button
      onClick={() => cancelBooking(b._id)}
      className="px-3 py-1 bg-red-500 text-white rounded text-sm"
    >
      Cancel
    </button>
  )}

  {/* DELETE BUTTON */}
  <button
    onClick={async () => {
      if (!window.confirm("Delete this booking permanently?")) return;
      await axios.delete(`/api/bookings/${b._id}`, { 
        headers: { Authorization: `Bearer ${await getToken()}` } 
      });
      toast.success("Booking deleted");
      load();
    }}
    className="px-3 py-1 bg-black text-white rounded text-sm"
  >
    Delete
  </button>
</div>

        </div>
      ))}
    </div>
  );
}
