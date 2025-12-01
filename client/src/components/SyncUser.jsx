// client/src/components/SyncUser.jsx
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

export default function SyncUser() {
  const { isLoaded, isSignedIn } = useUser();
  const { axios } = useAppContext(); // axios is the api instance from AppContext

  useEffect(() => {
    const sync = async () => {
      if (!isLoaded || !isSignedIn) return;
      try {
        // use relative path — axios will prepend VITE_BACKEND_URL
        await axios.post("/api/user/sync");
      } catch (err) {
        console.error("User sync failed:", err);
      }
    };
    sync();
    // axios is stable (useMemo in AppContext) so safe to include in deps
  }, [isLoaded, isSignedIn, axios]);

  return null;
}
