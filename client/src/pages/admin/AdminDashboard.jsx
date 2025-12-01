// AdminDashboard.modified.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const StatCard = ({ label, value, change, positive }) => (
  <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-3 flex flex-col gap-1">
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="text-2xl font-semibold text-slate-900">{value}</p>
    {change && (
      <p
        className={`text-xs font-medium ${
          positive ? "text-emerald-600" : "text-rose-600"
        }`}
      >
        {positive ? "▲" : "▼"} {change}
      </p>
    )}
  </div>
);

const AdminBookingsTable = ({ rows, currency, onRowClick }) => {
  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
        No bookings yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">Latest bookings</p>
        <p className="text-xs text-slate-500">Showing {rows.length} recent records</p>
      </div>
      <div className="max-h-80 overflow-y-auto text-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Guest</th>
              <th className="px-4 py-2 font-medium">Hotel / Room</th>
              <th className="px-4 py-2 font-medium">Dates</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Customization</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((b) => {
              const amount = b.totalPrice?.toLocaleString() ?? "0";
              const checkIn = b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : "—";
              const checkOut = b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : "—";

              let badgeClasses =
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium";
              if (b.status === "confirmed") {
                badgeClasses += " bg-emerald-50 border-emerald-200 text-emerald-700";
              } else if (b.status === "cancelled") {
                badgeClasses += " bg-rose-50 border-rose-200 text-rose-700";
              } else {
                badgeClasses += " bg-amber-50 border-amber-200 text-amber-700";
              }

              const custom = b.customization;
              const customSummary = custom
                ? (() => {
                    const parts = [];
                    if (custom.guestsRange) parts.push(`${custom.guestsRange.min}-${custom.guestsRange.max} guests`);
                    if (custom.daysRange) parts.push(`${custom.daysRange.min}-${custom.daysRange.max} days`);
                    if (custom.packageText) parts.push(custom.packageText.length > 30 ? custom.packageText.slice(0, 28) + "…" : custom.packageText);
                    return parts.join(" • ");
                  })()
                : "—";

              const customBadge = custom ? (
                <span className="inline-flex items-center rounded-full bg-pink-50 border border-pink-100 text-pink-700 px-2 py-0.5 text-[11px]">
                  Custom
                </span>
              ) : null;

              return (
                <tr
                  key={b._id}
                  className="hover:bg-slate-50/60 cursor-pointer"
                  onClick={() => onRowClick(b)}
                >
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {b.billingName || b.user?.username || "—"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {b.billingPhone || b.user?.email || ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="text-slate-900">{b.hotel?.name ?? "Hotel"}</span>
                      <span className="text-xs text-slate-500">{b.room?.roomType ?? "Room"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-xs text-slate-600">
                    {checkIn} – {checkOut}
                  </td>
                  <td className="px-4 py-2 align-top text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {currency} {amount}
                  </td>

                  {/* Customization column */}
                  <td className="px-4 py-2 align-top text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      {customBadge}
                      <div className="text-xs text-slate-500">{customSummary}</div>
                    </div>
                  </td>

                  <td className="px-4 py-2 align-top">
                    <span className={badgeClasses}>{b.isPaid ? "Paid" : b.status ?? "pending"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BookingDetailsModal = ({ booking, open, onClose, currency, onAction }) => {
  if (!open || !booking) return null;

  const checkIn = booking.checkInDate ? new Date(booking.checkInDate).toDateString() : "—";
  const checkOut = booking.checkOutDate ? new Date(booking.checkOutDate).toDateString() : "—";
  const nights = booking.customization?.nights ?? (booking.checkInDate && booking.checkOutDate ? Math.max(1, Math.ceil((new Date(booking.checkOutDate)-new Date(booking.checkInDate))/(1000*60*60*24))) : 1);

  const addons = booking.customization?.addOnSummary || [];
  const addonsTotal = booking.customization?.addonsTotal ?? 0;
  const roomTotal = (booking.totalPrice ?? 0) - addonsTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">Booking details</h3>
            <p className="text-xs text-slate-500">Booking ID: {booking._id}</p>
          </div>
          <div>
            <button onClick={onClose} className="text-sm text-slate-600">Close</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs text-slate-400">Guest</h4>
              <p className="font-medium">{booking.billingName || booking.user?.username || "—"}</p>
              <p className="text-xs text-slate-500 mt-1">{booking.billingPhone || booking.user?.email || "—"}</p>
            </div>

            <div>
              <h4 className="text-xs text-slate-400">Package</h4>
              <p className="font-medium">{booking.hotel?.name || "—"}</p>
              <p className="text-xs text-slate-500 mt-1">{booking.room?.roomType || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <h4 className="text-xs text-slate-400">Check-in</h4>
              <p className="font-medium">{checkIn}</p>
            </div>
            <div>
              <h4 className="text-xs text-slate-400">Check-out</h4>
              <p className="font-medium">{checkOut}</p>
            </div>
            <div>
              <h4 className="text-xs text-slate-400">Nights</h4>
              <p className="font-medium">{nights}</p>
            </div>
          </div>

          <div className="border rounded p-3">
            <h4 className="text-sm font-medium">Price breakdown</h4>
            <div className="mt-2 text-sm text-slate-700 space-y-1">
              <div className="flex justify-between">
                <div>Room total</div>
                <div>{currency} {roomTotal.toLocaleString()}</div>
              </div>
              <div className="flex justify-between">
                <div>Add-ons</div>
                <div>{currency} {addonsTotal.toLocaleString()}</div>
              </div>
              <div className="flex justify-between font-semibold mt-2">
                <div>Grand total</div>
                <div>{currency} {booking.totalPrice?.toLocaleString()}</div>
              </div>
            </div>

            {addons.length > 0 && (
              <>
                <hr className="my-3" />
                <div className="text-xs text-slate-500 mb-2">Add-ons</div>
                <ul className="text-sm list-disc ml-5 space-y-1">
                  {addons.map((a) => (
                    <li key={a.id}>
                      {a.label} × {a.qty} — {currency} {a.lineTotal?.toLocaleString() ?? (a.pricePerUnit * a.qty).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div>
            <h4 className="text-xs text-slate-400">Customization notes</h4>
            <div className="mt-2 text-sm text-slate-700">
              {booking.customization ? (
                <>
                  {/* Guest range */}
                  {booking.customization.guestsRange && (
                    <div className="text-sm">
                      <strong>Guests:</strong>{" "}
                      {booking.customization.guestsRange.min} - {booking.customization.guestsRange.max}
                    </div>
                  )}
                  {/* Day range */}
                  {booking.customization.daysRange && (
                    <div className="text-sm">
                      <strong>Days:</strong>{" "}
                      {booking.customization.daysRange.min} - {booking.customization.daysRange.max}
                    </div>
                  )}

                  {/* packageText / included things */}
                  {booking.customization.packageText ? (
                    <p className="mt-2">{booking.customization.packageText}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">No package text provided</p>
                  )}

                  {/* any add-on list */}
                  {addons.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-slate-500">Requested add-ons</div>
                      <ul className="list-disc ml-5 text-sm mt-1">
                        {addons.map((a) => (
                          <li key={a.id}>{a.label} × {a.qty} — {currency}{a.lineTotal?.toLocaleString() ?? (a.pricePerUnit * a.qty).toLocaleString()}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-slate-500">Status: <span className="font-medium">{booking.customization?.status ?? "pending"}</span></div>
                </>
              ) : (
                <p className="text-xs text-slate-400">No custom notes</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs text-slate-400">Billing</h4>
            <p className="text-sm">{booking.billingName} • {booking.billingPhone}</p>
            <p className="text-xs text-slate-500 mt-1">Payment method: {booking.paymentMethod || "—"}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 items-center">
            {booking.customization ? (
              <>
                <button
                  onClick={() => onAction("approveCustomization", booking)}
                  className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
                >
                  Approve customization
                </button>
                <button
                  onClick={() => onAction("declineCustomization", booking)}
                  className="px-3 py-2 rounded border text-sm"
                >
                  Decline customization
                </button>
              </>
            ) : null}

            {booking.status !== "confirmed" && (
              <button
                onClick={() => onAction("confirmBooking", booking)}
                className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
              >
                Mark as Confirmed
              </button>
            )}
            {booking.status !== "cancelled" && (
              <button
                onClick={() => onAction("cancelBooking", booking)}
                className="px-3 py-2 rounded border text-sm"
              >
                Cancel booking
              </button>
            )}

            <button
              onClick={() => onAction("downloadReceipt", booking)}
              className="px-3 py-2 rounded bg-slate-100 text-sm"
            >
              Download receipt (PDF)
            </button>

            {/* NEW: Delete booking button (danger) */}
            <button
              onClick={() => {
                if (!window.confirm("Delete booking permanently? This action cannot be undone.")) return;
                onAction("deleteBooking", booking);
              }}
              className="px-3 py-2 rounded bg-black text-white text-sm"
            >
              Delete Booking
            </button>

            <div className="ml-auto text-xs text-slate-500">Updated: {new Date(booking.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { axios, getToken, currency } = useAppContext();
  const [overview, setOverview] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // new: filter for customizations-only
  const [customOnly, setCustomOnly] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/admin/bookings", {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        if (data.success) setRows(data.bookings || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/admin/overview", {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        if (data.success) setOverview(data.overview);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const refreshBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setRows(data.bookings || []);
    } catch (e) {
      console.error(e);
    }
  };

  const onRowClick = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const onAction = async (action, booking) => {
    if (!booking?._id) return;
    setActionLoading(true);
    try {
      const token = await getToken();

      if (action === "approveCustomization") {
        await axios.post(`/api/admin/bookings/${booking._id}/customization/approve`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Customization approved");
      } else if (action === "declineCustomization") {
        await axios.post(`/api/admin/bookings/${booking._id}/customization/decline`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Customization declined");
      } else if (action === "confirmBooking") {
        await axios.post(`/api/admin/bookings/${booking._id}/confirm`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Booking confirmed");
      } else if (action === "cancelBooking") {
        await axios.post(`/api/admin/bookings/${booking._id}/cancel`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Booking cancelled");
      } else if (action === "downloadReceipt") {
        const resp = await axios.get(`/api/bookings/${booking._id}/receipt`, {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        });
        const url = window.URL.createObjectURL(new Blob([resp.data], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `receipt-${booking._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Receipt download started");
      } else if (action === "deleteBooking") {
        // Delete booking (admin)
        await axios.delete(`/api/bookings/${booking._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Booking deleted");
        // refresh and close modal
        await refreshBookings();
        setModalOpen(false);
        setSelectedBooking(null);
      }

      await refreshBookings();
      if (modalOpen) {
        const updated = rows.find((r) => r._id === booking._id) || booking;
        setSelectedBooking(updated);
      }
    } catch (err) {
      console.error("Admin action error:", err);
      toast.error("Action failed — check console");
    } finally {
      setActionLoading(false);
    }
  };

  const stats = overview || {
    totalUsers: "—",
    totalHotels: "—",
    totalRooms: "—",
    totalBookings: "—",
    totalRevenue: 0,
  };

  // memoized filtered rows
  const visibleRows = useMemo(() => {
    if (!customOnly) return rows;
    return rows.filter((r) => !!r.customization);
  }, [rows, customOnly]);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            High-level view of users, hotels and bookings across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>Live environment</span>
        </div>
      </div>

      {/* metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} change="+4.2% this month" positive />
        <StatCard label="Total Hotels" value={stats.totalHotels} change="+2 new" positive />
        <StatCard label="Total Rooms" value={stats.totalRooms} change="+18 listed" positive />
        <StatCard label="Total Revenue" value={`${currency} ${stats.totalRevenue.toLocaleString()}`} change="+12.4%" positive />
      </div>

      {/* main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_minmax(260px,1fr)] gap-5">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-900">Booking activity</p>
            <span className="text-xs text-slate-500">Last 7 days</span>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2 h-28 items-end">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="rounded-full bg-slate-100 border border-slate-200" style={{ height: `${40 + (i % 4) * 10}px` }} />
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Real charts (Recharts) can be plugged here later.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-900 mb-2">Change window</p>
            <p className="text-xs text-slate-600 mb-2">Use this dashboard as the control center to manage hotels, users and bookings before rolling out major changes.</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Review new hotel registrations</li>
              <li>• Monitor high-value bookings</li>
              <li>• Audit platform usage</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-900 mb-2">Quick actions</p>
            <button className="w-full mb-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50" type="button">Review pending hotels</button>
            <button className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50" type="button">View flagged bookings</button>
          </div>
        </div>
      </div>

      {/* controls above table */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={customOnly} onChange={() => setCustomOnly((s) => !s)} />
            <span className="text-sm text-slate-700">Customizations only</span>
          </label>
          <div className="text-xs text-slate-500">Showing {visibleRows.length} / {rows.length}</div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={refreshBookings} className="text-xs px-3 py-1 border rounded bg-slate-50">Refresh</button>
        </div>
      </div>

      {/* bookings table */}
      <AdminBookingsTable rows={visibleRows} currency={currency} onRowClick={onRowClick} />

      {/* booking details modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currency={currency}
        onAction={onAction}
      />
    </div>
  );
};

export default AdminDashboard;
