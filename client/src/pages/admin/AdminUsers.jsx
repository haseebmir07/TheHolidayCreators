import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

export default function AdminUsers() {
  const { axios, getToken, toast } = useAppContext();
  const [users, setUsers] = useState([]);

  const load = async () => {
    const { data } = await axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${await getToken()}` }});
    if (data.success) setUsers(data.users);
  };

  const changeRole = async (id, role) => {
    await axios.put(`/api/admin/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${await getToken()}` }});
    toast.success("Role Updated");
    load();
  };

  const removeUser = async (id) => {
    if (!window.confirm("Remove user permanently?")) return;
    await axios.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${await getToken()}` }});
    toast.success("Deleted");
    load();
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Users Management</h2>

      {users.map(u => (
        <div key={u._id} className="border p-3 rounded-lg bg-white flex justify-between items-center">
          <div>
            <p className="font-medium">{u.username}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>

          <div className="flex gap-2">
            <select
              className="border rounded px-2"
              value={u.role}
              onChange={e => changeRole(u._id, e.target.value)}
            >
              <option value="user">User</option>
              <option value="hotelOwner">Hotel Owner</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={() => removeUser(u._id)}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
