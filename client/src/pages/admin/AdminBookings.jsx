import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../../context/AppContext";

export default function AdminBookings() {
  const { axios, getToken, toast } = useAppContext();
  const [rows, setRows] = useState([]);

  const [loadingCancelId, setLoadingCancelId] = useState(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [loadingPayId, setLoadingPayId] = useState(null);
  const [loadingList, setLoadingList] = useState(false);

  const isMounted = useRef(true);

  // cleanup flag
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // load bookings (no Cache-Control header to avoid CORS preflight issues)
  const load = async (allowRetry = true) => {
    setLoadingList(true);

    if (!axios || !getToken) {
      console.error("AdminBookings: axios or getToken missing from context");
      toast.error("Client configuration error (axios/getToken missing). Check console.");
      if (isMounted.current) setRows([]);
      setLoadingList(false);
      return false;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error("AdminBookings: getToken returned empty token");
        toast.error("Auth token missing — please login.");
        if (isMounted.current) setRows([]);
        setLoadingList(false);
        return false;
      }

      // cache-bust with ts query param only (avoid extra headers)
      const url = `/api/admin/bookings?ts=${Date.now()}`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!data) {
        console.error("AdminBookings: axios returned no data", { url });
        toast.error("Unexpected server response (no data). See console.");
        if (isMounted.current) setRows([]);
        setLoadingList(false);
        return false;
      }

      if (data.success) {
        const bookings = Array.isArray(data.bookings) ? data.bookings : [];
        if (isMounted.current) setRows(bookings);
        setLoadingList(false);
        return true;
      } else {
        console.error("AdminBookings: API returned success=false", data);
        toast.error(data.message || "Failed to load bookings (server).");
        if (isMounted.current) setRows(Array.isArray(data.bookings) ? data.bookings : []);
        setLoadingList(false);

        if (allowRetry) {
          // one retry for transient issues
          await wait(300);
          return load(false);
        }
        return false;
      }
    } catch (err) {
      // robust error logging and user message
      console.error("AdminBookings: load() error", err);
      const serverMessage = err?.response?.data?.message || err?.message || "Network error";
      toast.error(`Failed to load bookings: ${serverMessage}`);
      if (isMounted.current) setRows([]);
      setLoadingList(false);

      if (allowRetry) {
        await wait(300);
        return load(false);
      }
      return false;
    }
  };

  useEffect(() => {
    load().catch((e) => {
      console.error("AdminBookings: unexpected load error", e);
      toast.error("Unexpected error while loading bookings (see console).");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MARK PAID
  const markPaid = async (id) => {
    try {
      setLoadingPayId(id);
      const token = await getToken();
      await axios.patch(`/api/admin/bookings/${id}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Marked Paid");
      await load();
    } catch (err) {
      console.error("markPaid error:", err);
      const msg = err?.response?.data?.message || "Failed to mark paid";
      toast.error(msg);
    } finally {
      setLoadingPayId(null);
    }
  };

  // CANCEL (optimistic)
  const cancelBooking = async (id) => {
    const prev = rows;
    setRows((r) => r.map((it) => (it._id === id ? { ...it, status: "cancelled" } : it)));

    try {
      setLoadingCancelId(id);
      const token = await getToken();
      await axios.patch(`/api/admin/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Cancelled");
      await load();
    } catch (err) {
      console.error("cancelBooking error:", err);
      toast.error(err?.response?.data?.message || "Failed to cancel booking — reverting UI");
      if (isMounted.current) setRows(prev);
    } finally {
      setLoadingCancelId(null);
    }
  };

  // DELETE (optimistic)
  const deleteBooking = async (id) => {
    const prev = rows;
    setRows((r) => r.filter((it) => it._id !== id));

    try {
      setLoadingDeleteId(id);
      const token = await getToken();
      await axios.delete(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking deleted");
      await load();
    } catch (err) {
      console.error("deleteBooking error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete booking — reverting UI");
      if (isMounted.current) setRows(prev);
    } finally {
      setLoadingDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bookings Management</h2>

      {loadingList && (
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
          Loading bookings…
        </div>
      )}

      {!loadingList && rows.length === 0 && (
        <div className="text-sm text-slate-500">No bookings found.</div>
      )}

      {rows.map((b) => (
        <div key={b._id} className="border p-3 rounded-lg bg-white flex justify-between items-center">
          <div>
            <p className="font-medium">{b.hotel?.name ?? "—"} • {b.room?.roomType ?? "—"}</p>
            <p className="text-xs text-slate-400">{b.user?.username ?? "—"} • {b.billingPhone ?? "—"}</p>
            <p className="text-xs mt-1"><span className="font-medium">Status:</span>{" "}
              <span className={b.status === "cancelled" ? "text-red-600" : "text-slate-600"}>
                {b.status ?? "—"}
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            {!b.isPaid && (
              <button onClick={() => markPaid(b._id)} disabled={loadingPayId === b._id}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${loadingPayId === b._id ? "bg-green-400" : "bg-green-500 text-white"}`}>
                {loadingPayId === b._id ? <> <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Updating… </> : "Mark Paid"}
              </button>
            )}

            {b.status !== "cancelled" && (
              <button onClick={() => cancelBooking(b._id)} disabled={loadingCancelId === b._id}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${loadingCancelId === b._id ? "bg-red-400" : "bg-red-500 text-white"}`}>
                {loadingCancelId === b._id ? <> <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Cancelling… </> : "Cancel"}
              </button>
            )}

            <button onClick={async () => { if (!window.confirm("Delete this booking permanently?")) return; await deleteBooking(b._id); }}
              disabled={loadingDeleteId === b._id}
              className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${loadingDeleteId === b._id ? "bg-black/60 text-white" : "bg-black text-white"}`}>
              {loadingDeleteId === b._id ? <> <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Deleting… </> : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
