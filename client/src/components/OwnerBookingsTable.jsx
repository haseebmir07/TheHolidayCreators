import { useState } from "react";

function Row({ booking, currency }) {
  const [open, setOpen] = useState(false);

  const fmt = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return isNaN(date) ? "—" : date.toLocaleString();
  };

  const amount = (booking.totalPrice ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
  });

  const statusColor =
    booking.status === "confirmed"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : booking.status === "cancelled"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="border-b border-slate-100 last:border-0 bg-white">
      {/* summary row */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 flex-shrink-0"
            aria-hidden="true"
          >
            {open ? "▾" : "▸"}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900">
              <span className="truncate max-w-[160px]">
                {booking.user?.username ?? "—"}
              </span>
              <span className="text-slate-400">•</span>
              <span className="truncate max-w-[140px]">
                {booking.room?.roomType ?? "Room"}
              </span>
              <span className="text-slate-400">•</span>
              <span className="truncate max-w-[160px]">
                {booking.hotel?.name ?? "Hotel"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 truncate">
              {fmt(booking.checkInDate)} – {fmt(booking.checkOutDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-sm font-semibold text-slate-900">
            {currency} {amount}
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor}`}
          >
            {booking.isPaid ? "Paid" : booking.status ?? "pending"}
          </span>
        </div>
      </button>

      {/* detail panel */}
      {open && (
        <div className="px-5 pb-4">
          <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-xs md:text-sm text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Column 1: guest info */}
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Guest
                </p>
                <div>
                  <span className="text-slate-500">User Name: </span>
                  <span className="font-medium">
                    {booking.user?.username ?? "—"}
                  </span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Email: </span>
                  <span>{booking.user?.email ?? "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Guests: </span>
                  <span>{booking.guests ?? "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Billing Name: </span>
                  <span>{booking.billingName ?? "—"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Billing Phone: </span>
                  <span>{booking.billingPhone ?? "—"}</span>
                </div>
              </div>

              {/* Column 2: stay info */}
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Stay
                </p>
                <div>
                  <span className="text-slate-500">Check-in: </span>
                  <span>{fmt(booking.checkInDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Check-out: </span>
                  <span>{fmt(booking.checkOutDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Nights: </span>
                  <span>{booking.nights ?? "—"}</span>
                </div>
              </div>

              {/* Column 3: payment info */}
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Payment
                </p>
                <div>
                  <span className="text-slate-500">Booked At: </span>
                  <span>{fmt(booking.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Payment: </span>
                  <span>{booking.isPaid ? "Paid" : "Unpaid"}</span>
                </div>
                <div>
                  <span className="text-slate-500">Status: </span>
                  <span className="capitalize">
                    {booking.status ?? "pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerBookingsTable({ bookings = [], currency = "$" }) {
  if (!bookings.length) {
    return (
      <div className="mt-4 rounded-xl border border-slate-100 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
        No bookings yet.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-800">
        Recent Bookings
      </div>
      <div className="max-h-80 overflow-y-auto">
        {bookings.map((b) => (
          <Row key={b._id} booking={b} currency={currency} />
        ))}
      </div>
    </div>
  );
}
