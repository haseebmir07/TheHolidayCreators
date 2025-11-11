// client/src/components/SyncUser.jsx
import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";

export default function SyncUser() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const sync = async () => {
      if (!isLoaded || !isSignedIn) return;
      try {
        await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`, // <-- important
          },
          // credentials: "include", // not needed if you pass the token
        });
      } catch (err) {
        console.error("User sync failed:", err);
      }
    };
    sync();
  }, [isLoaded, isSignedIn, getToken]);

  return null;
}
