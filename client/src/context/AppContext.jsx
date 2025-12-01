// client/src/context/AppContext.jsx
import { useAuth, useUser } from "@clerk/clerk-react";
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const AppContext = createContext();

export const AppProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();

    // Create axios instance inside provider so we can use getToken in interceptor
    const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    // Use useMemo so instance is stable across re-renders
    const api = useMemo(() => {
      const instance = axios.create({
        baseURL: API_BASE,
        withCredentials: true, // set true if you use cookies & sessions
      });

      // Attach async interceptor to add Authorization header using Clerk's getToken
      instance.interceptors.request.use(
        async (config) => {
          try {
            // getToken is provided by Clerk's useAuth and returns a promise
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
            // ignore token attach errors — request will proceed without auth header
            console.warn("Failed to attach token to request:", err?.message || err);
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      return instance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_BASE, getToken]); // recreate only if backend URL or getToken changes

    // debug log — remove when verified
    useEffect(() => {
      console.log("API baseURL:", API_BASE);
    }, [API_BASE]);

    const [isOwner, setIsOwner] = useState(false);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [searchedCities, setSearchedCities] = useState([]); // max 3 recent searched cities

    const facilityIcons = {
        "Free WiFi": assets.freeWifiIcon,
        "Free Breakfast": assets.freeBreakfastIcon,
        "Room Service": assets.roomServiceIcon,
        "Mountain View": assets.mountainIcon,
        "Pool Access": assets.poolIcon,
    };

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/api/user', { headers: { Authorization: `Bearer ${await getToken()}` } });
            if (data.success) {
                setIsOwner(data.role === "hotelOwner");
                setSearchedCities(data.recentSearchedCities);
            } else {
                // Retry Fetching User Details after 2 seconds (useful when account creation is in-flight)
                setTimeout(() => {
                    fetchUser();
                }, 2000);
            }
        } catch (error) {
            // prefer error.response?.data?.message if available
            const msg = error?.response?.data?.message || error?.message || "Failed to fetch user";
            toast.error(msg);
            console.error("fetchUser error:", error);
        }
    }

    const fetchRooms = async () => {
        try {
            const { data } = await api.get('/api/rooms');
            if (data.success) {
                setRooms(data.rooms);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Failed to fetch rooms";
            toast.error(msg);
            console.error("fetchRooms error:", error);
        }
    }

    useEffect(() => {
        if (user) {
            fetchUser();
        }
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
        axios: api,      // expose api instance as `axios` so existing code keeps working
        api,             // also expose as `api` for clarity if you want to switch usage
        showHotelReg,
        setShowHotelReg,
        facilityIcons,
        rooms,
        setRooms,
        searchedCities,
        setSearchedCities
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );

};
console.log("API baseURL:", api.defaults.baseURL || import.meta.env.VITE_BACKEND_URL)


export const useAppContext = () => useContext(AppContext);
export default AppContext;
