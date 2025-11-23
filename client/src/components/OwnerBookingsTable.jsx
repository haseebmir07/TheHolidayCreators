// components/OwnerBookingsTable.jsx
import { useEffect, useState } from "react";

function Row({ booking, currency }) {
  const [open, setOpen] = useState(false);

  const fmt = (d) => new Date(d).toLocaleString();
  const amount = (booking.totalPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0 });

  return (
    <div className="border-b">
      {/* summary row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span className="inline-block w-5 text-center">{open ? "▾" : "▸"}</span>
          <div className="font-medium">{booking.user?.username ?? "—"}</div>
          <div className="text-gray-500">• {booking.room?.roomType ?? "Room"}</div>
          <div className="text-gray-500">• {booking.hotel?.name ?? "Hotel"}</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-gray-700">{currency} {amount}</div>
          <span className={`px-2.5 py-1 rounded-full text-xs
            ${booking.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {booking.isPaid ? "Paid" : booking.status ?? "Pending"}
          </span>
        </div>
      </button>

      {/* detail panel */}
      {open && (
        <div className="grid md:grid-cols-3 gap-4 px-8 pb-4 text-sm text-gray-700">
          <div className="space-y-1">
            <div><span className="text-gray-500">User Name: </span>{booking.user?.username ?? "—"}</div>
            <div><span className="text-gray-500">Email: </span>{booking.user?.email ?? "—"}</div>
            <div><span className="text-gray-500">Guests: </span>{booking.guests ?? "—"}</div>
            {/* 🔹 New billing details */}
            <div><span className="text-gray-500">Billing Name: </span>{booking.billingName ?? "—"}</div>
            <div><span className="text-gray-500">Billing Phone: </span>{booking.billingPhone ?? "—"}</div>
          </div>
          <div className="space-y-1">
            <div><span className="text-gray-500">Check-in: </span>{fmt(booking.checkInISO || booking.checkInDate)}</div>
            <div><span className="text-gray-500">Check-out: </span>{fmt(booking.checkOutISO || booking.checkOutDate)}</div>
            <div><span className="text-gray-500">Nights: </span>{booking.nights ?? "—"}</div>
          </div>
          <div className="space-y-1">
            <div><span className="text-gray-500">Booked At: </span>{fmt(booking.createdAtISO || booking.createdAt)}</div>
            <div><span className="text-gray-500">Payment: </span>{booking.isPaid ? "Paid" : "Unpaid"}</div>
            <div><span className="text-gray-500">Status: </span>{booking.status ?? "pending"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerBookingsTable({ currency = "$" }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/bookings/owner`, { credentials: "include" });
        const data = await res.json();
        if (data.success) setRows(data.bookings);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading bookings…</div>;
  if (!rows.length) return <div className="p-4 text-gray-500">No bookings yet.</div>;

  return (
    <div className="rounded-xl border bg-white">
      {/* <div className="px-6 py-3 border-b font-semibold">Recent Bookings</div> */}
      <div className="divide-y">
        {rows.map(b => <Row key={b._id} booking={b} currency={currency} />)}
      </div>
    </div>
  );
}
