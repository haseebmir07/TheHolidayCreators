import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

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

const AdminBookingsTable = () => {
  const { axios, getToken, currency } = useAppContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/admin/bookings", {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        if (data.success) setRows(data.bookings);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
        Loading latest bookings…
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
        No bookings yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-900">
          Latest bookings
        </p>
        <p className="text-xs text-slate-500">
          Showing {rows.length} recent records
        </p>
      </div>
      <div className="max-h-80 overflow-y-auto text-sm">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Guest</th>
              <th className="px-4 py-2 font-medium">Hotel / Room</th>
              <th className="px-4 py-2 font-medium">Dates</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((b) => {
              const amount = b.totalPrice?.toLocaleString() ?? "0";
              const checkIn = b.checkInDate
                ? new Date(b.checkInDate).toLocaleDateString()
                : "—";
              const checkOut = b.checkOutDate
                ? new Date(b.checkOutDate).toLocaleDateString()
                : "—";

              let badgeClasses =
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium";
              if (b.status === "confirmed") {
                badgeClasses +=
                  " bg-emerald-50 border-emerald-200 text-emerald-700";
              } else if (b.status === "cancelled") {
                badgeClasses += " bg-rose-50 border-rose-200 text-rose-700";
              } else {
                badgeClasses += " bg-amber-50 border-amber-200 text-amber-700";
              }

              return (
                <tr key={b._id} className="hover:bg-slate-50/60">
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
                      <span className="text-slate-900">
                        {b.hotel?.name ?? "Hotel"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {b.room?.roomType ?? "Room"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-xs text-slate-600">
                    {checkIn} – {checkOut}
                  </td>
                  <td className="px-4 py-2 align-top text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {currency} {amount}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <span className={badgeClasses}>
                      {b.isPaid ? "Paid" : b.status ?? "pending"}
                    </span>
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

const AdminDashboard = () => {
  const { axios, getToken, currency } = useAppContext();
  const [overview, setOverview] = useState(null);

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

  const stats = overview || {
    totalUsers: "—",
    totalHotels: "—",
    totalRooms: "—",
    totalBookings: "—",
    totalRevenue: 0,
  };

  return (
    <div className="space-y-6">
      {/* header row */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            High-level view of users, hotels and bookings across the platform.
            Use this area to review and push updates to the live experience.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>Live environment</span>
        </div>
      </div>

      {/* metric cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          change="+4.2% this month"
          positive
        />
        <StatCard
          label="Total Hotels"
          value={stats.totalHotels}
          change="+2 new"
          positive
        />
        <StatCard
          label="Total Rooms"
          value={stats.totalRooms}
          change="+18 listed"
          positive
        />
        <StatCard
          label="Total Revenue"
          value={`${currency} ${stats.totalRevenue.toLocaleString()}`}
          change="+12.4%"
          positive
        />
      </div>

      {/* second row: left = "chart", right = side panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_minmax(260px,1fr)] gap-5">
        {/* faux chart / trends card */}
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-900">
              Booking activity
            </p>
            <span className="text-xs text-slate-500">Last 7 days</span>
          </div>
          {/* Placeholder "chart" stripes to mimic Dribbble style */}
          <div className="mt-3 grid grid-cols-7 gap-2 h-28 items-end">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="rounded-full bg-slate-100 border border-slate-200"
                style={{ height: `${40 + (i % 4) * 10}px` }}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Real charts (Recharts) can be plugged here later – this is a visual
            placeholder matching the concept of the Dribbble design.
          </p>
        </div>

        {/* right-side info cards */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-900 mb-2">
              Change window
            </p>
            <p className="text-xs text-slate-600 mb-2">
              Use this dashboard as the control center to manage hotels, users
              and bookings before rolling out major changes to customers.
            </p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Review new hotel registrations</li>
              <li>• Monitor high-value bookings</li>
              <li>• Audit platform usage</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-900 mb-2">
              Quick actions
            </p>
            <button
              className="w-full mb-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              type="button"
            >
              Review pending hotels
            </button>
            <button
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              type="button"
            >
              View flagged bookings
            </button>
          </div>
        </div>
      </div>

      {/* bottom row: latest bookings table */}
      <AdminBookingsTable />
    </div>
  );
};

export default AdminDashboard;
