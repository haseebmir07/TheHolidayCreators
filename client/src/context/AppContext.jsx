// client/src/context/AppContext.jsx
import { useAuth, useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);

  const facilityIcons = {
    "Free WiFi": assets.freeWifiIcon,
    "Free Breakfast": assets.freeBreakfastIcon,
    "Room Service": assets.roomServiceIcon,
    "Mountain View": assets.mountainIcon,
    "Pool Access": assets.poolIcon,
  };

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // stable axios instance
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE,
      withCredentials: true,
    });

    instance.interceptors.request.use(
      async (config) => {
        try {
          if (typeof getToken === "function") {
            const token = await getToken();
            if (token) {
              config.headers = {
                ...(config.headers || {}),
                Authorization: `Bearer ${token}`,
              };
            }
          }
        } catch (err) {
          // ignore token errors
          console.warn("Failed to attach auth token:", err?.message || err);
        }
        return config;
      },
      (err) => Promise.reject(err)
    );

    return instance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, getToken]);

  // debug log to confirm build-time baseURL
  useEffect(() => {
    console.log("API baseURL:", api.defaults.baseURL || API_BASE);
  }, [api, API_BASE]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/user", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities || []);
      } else {
        setTimeout(fetchUser, 2000);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to fetch user";
      toast.error(msg);
      console.error("fetchUser error:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/api/rooms");
      if (data.success) setRooms(data.rooms || []);
      else toast.error(data.message || "Failed to fetch rooms");
    } catch (error) {
      toast.error(error?.message || "Failed to fetch rooms");
      console.error("fetchRooms error:", error);
    }
  };

  useEffect(() => {
    if (user) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios: api,
    api,
    showHotelReg,
    setShowHotelReg,
    facilityIcons,
    rooms,
    setRooms,
    searchedCities,
    setSearchedCities,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
export default AppContext;
