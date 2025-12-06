// src/pages/AllRooms.jsx
import { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";
import HotelCard from "../components/HotelCard";

const CheckBox = ({ label, selected = true, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const RadioButton = ({ label, selected = true, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="radio"
        name="sortOption"
        checked={selected}
        onChange={() => onChange(label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const AllRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, currency } = useAppContext();
  const [openFilters, setOpenFilters] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: [],
  });
  const [selectedSort, setSelectedSort] = useState("");

  const initialDestination = searchParams.get("destination") || "All";
  const [selectedDestination, setSelectedDestination] =
    useState(initialDestination);

  const priceRanges = [
    "0 to 500",
    "500 to 1000",
    "1000 to 2000",
    "2000 to 9000",
  ];

  const sortOptions = ["Price Low to High", "Price High to Low", "Newest First"];

  const destinations = useMemo(() => {
    const set = new Set();
    rooms.forEach((room) => {
      if (room.hotel?.city) set.add(room.hotel.city);
    });
    return Array.from(set);
  }, [rooms]);

  const getFullPrice = (room) => {
    if (typeof room.fullPrice === "number") return room.fullPrice;
    if (typeof room.totalPrice === "number") return room.totalPrice;
    if (room.pricePerNight && room.nights)
      return room.pricePerNight * room.nights;

    return room.pricePerNight || 0;
  };

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      if (checked) {
        updated[type] = [...updated[type], value];
      } else {
        updated[type] = updated[type].filter((i) => i !== value);
      }
      return updated;
    });
  };

  const handleSortChange = (option) => setSelectedSort(option);

  const handleDestinationChange = (value) => {
    setSelectedDestination(value);
    value === "All"
      ? setSearchParams({})
      : setSearchParams({ destination: value });
  };

  const matchesPriceRange = (room) => {
    const fullPrice = getFullPrice(room);

    return (
      selectedFilters.priceRange.length === 0 ||
      selectedFilters.priceRange.some((range) => {
        const [min, max] = range.split(" to ").map(Number);
        return fullPrice >= min && fullPrice <= max;
      })
    );
  };

  const filterDestination = (room) => {
    const destination =
      selectedDestination !== "All"
        ? selectedDestination
        : searchParams.get("destination");

    if (!destination || destination === "All") return true;
    return room.hotel?.city
      ?.toLowerCase()
      .includes(destination.toLowerCase());
  };

  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High")
      return getFullPrice(a) - getFullPrice(b);
    if (selectedSort === "Price High to Low")
      return getFullPrice(b) - getFullPrice(a);
    if (selectedSort === "Newest First")
      return new Date(b.createdAt) - new Date(a.createdAt);

    return 0;
  };

  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => matchesPriceRange(room) && filterDestination(room))
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, selectedDestination, searchParams]);

  const clearFilters = () => {
    setSelectedFilters({ priceRange: [] });
    setSelectedSort("");
    setSelectedDestination("All");
    setSearchParams({});
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* LEFT */}
      <div className="flex-1">
        <div className="flex flex-col items-start text-left">
          <h1 className="font-playfair text-4xl md:text-[40px]">Packages</h1>
          <p className="text-sm text-gray-500/90 mt-2 max-w-174">
            Take advantage of our limited-time offers and special packages to
            enhance your stay.
          </p>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <HotelCard key={room._id} room={room} />
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <p className="mt-8 text-gray-500 text-sm">No packages found.</p>
        )}
      </div>

      {/* RIGHT FILTERS */}
      <div className="bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16">
        <div
          className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${
            openFilters && "border-b"
          }`}
        >
          <p className="text-base font-medium text-gray-800">FILTERS</p>
          <div className="text-xs cursor-pointer">
            <span
              onClick={() => setOpenFilters(!openFilters)}
              className="lg:hidden"
            >
              {openFilters ? "HIDE" : "SHOW"}
            </span>
            <span onClick={clearFilters} className="hidden lg:block">
              CLEAR
            </span>
          </div>
        </div>

        <div
          className={`${
            openFilters ? "h-auto" : "h-0 lg:h-auto"
          } overflow-hidden transition-all duration-700`}
        >
          {/* DESTINATION */}
          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Destination</p>
            <select
              className="w-full border border-gray-300 rounded-md text-sm px-2 py-1 outline-none"
              value={selectedDestination}
              onChange={(e) => handleDestinationChange(e.target.value)}
            >
              <option value="All">All Destinations</option>
              {destinations.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE RANGE */}
          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Price Range</p>
            {priceRanges.map((range, index) => (
              <CheckBox
                key={index}
                label={`${currency} ${range}`}
                selected={selectedFilters.priceRange.includes(range)}
                onChange={(checked) =>
                  handleFilterChange(checked, range, "priceRange")
                }
              />
            ))}
          </div>

          {/* SORT BY */}
          <div className="px-5 pt-5 pb-7">
            <p className="font-medium text-gray-800 pb-2">Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton
                key={index}
                label={option}
                selected={selectedSort === option}
                onChange={() => handleSortChange(option)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRooms;
