import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const navItemClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100"
  }`;

const AdminLayout = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const role = user?.publicMetadata?.role;

  // simple client-side guard: if not admin, send home
  if (!isSignedIn || role !== "admin") {
    navigate("/");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-lg font-semibold tracking-tight">
            TheHolidayCreators-Admin
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
          <NavLink to="/admin" end className={navItemClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/5 text-xs">
              📊
            </span>
            <span>Dashboard</span>
          </NavLink>

          {/* Future: you can add these later */}
          <NavLink to="/admin/hotels" className={navItemClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/5 text-xs">
              🏨
            </span>
            <span>Packages</span>
          </NavLink>
          {/* <NavLink to="/admin/users" className={navItemClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/5 text-xs">
              👤
            </span>
            <span>Users</span>
          </NavLink> */}
          <NavLink to="/admin/bookings" className={navItemClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/5 text-xs">
              📁
            </span>
            <span>Bookings</span>
          </NavLink>
        </nav>

        <div className="px-4 py-4 border-t border-slate-100 text-xs text-slate-500">
          <p className="font-medium text-slate-700 mb-1">Environment</p>
          <p>Production preview</p>
          <p className="mt-1 text-[11px]">
            Use this dashboard to manage hotels, users and bookings before
            pushing changes live.
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Admin Panel
            </p>
            <p className="text-sm font-medium text-slate-900">
              Platform overview
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500 border border-slate-100">
              <span className="text-[10px]">●</span>
              <span>Changes here affect the live website</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                {user?.username || user?.fullName || "Admin"}
              </span>
              <img
                src={user?.imageUrl}
                alt="avatar"
                className="h-8 w-8 rounded-full object-cover border border-slate-200"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
