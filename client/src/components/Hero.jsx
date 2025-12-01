// src/components/Hero.jsx
import React, { useState, useEffect, useRef } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Hero = () => {
  const { navigate, getToken, axios, setSearchedCities } = useAppContext()
  const [destination, setDestination] = useState('')
  const [index, setIndex] = useState(0)
  const timeoutRef = useRef(null)

  // config: change duration (ms) here
  const DURATION = 3500 // 3 seconds per slide
  // fallback in case assets.heroImages is missing
  const images = (assets && assets.heroImages && assets.heroImages.length)
    ? assets.heroImages
    : ["/src/assets/heroImage.jpeg"]

  // automatic slider
  useEffect(() => {
    // clear any existing timer
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      setIndex(prev => (prev + 1) % images.length)
    }, DURATION)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [index, images.length])

  // optional: manual control
  const goTo = (i) => {
    setIndex(i % images.length)
  }

  const onSearch = async (e) => {
    e.preventDefault()
    navigate(`/rooms?destination=${destination}`)
    try {
      await axios.post('/api/user/store-recent-search', { recentSearchedCity: destination }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
    } catch (err) {
      // handle silently or show toast
      console.error('store recent search failed', err)
    }
    setSearchedCities((prevSearchedCities) => {
      const updatedSearchedCities = [...prevSearchedCities, destination]
      if (updatedSearchedCities.length > 3) {
        updatedSearchedCities.shift()
      }
      return updatedSearchedCities
    });
  }

  const currentImage = images[index]

  return (
    <div className='relative h-screen'>
      {/* Background images stack for smooth fade */}
      <div className="absolute inset-0 overflow-hidden">
        {images.map((img, i) => (
          <div
            key={i}
            aria-hidden={i !== index}
            className={`absolute inset-0 bg-no-repeat bg-center bg-cover transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        {/* semi-transparent overlay to keep text readable */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className='relative flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white h-full'>
        <p className='bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20'>The Ultimate Tour Experience</p>
        <h1 className='font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4'>
          Discover Your Perfect Gateway Destination
        </h1>
        <p className='max-w-130 mt-2 text-sm md:text-base'>
          Unparalleled luxury and comfort await at the world's most exclusive hotels and resorts. Start your journey today.
        </p>

        <form onSubmit={onSearch} className='bg-white text-gray-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto'>
          <div>
            <div className='flex items-center gap-2'>
              <img src={assets.calenderIcon} alt="" className='h-4' />
              <label htmlFor="destinationInput">Destination</label>
            </div>
            <input list='destinations' onChange={e => setDestination(e.target.value)} value={destination} id="destinationInput" type="text" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" placeholder="Type here" required />
            <datalist id="destinations">
              {cities.map((city, index) => (
                <option key={index} value={city} />
              ))}
            </datalist>
          </div>

          <div>
            <div className='flex items-center gap-2'>
              <img src={assets.calenderIcon} alt="" className='h-4' />
              <label htmlFor="checkIn">Check in</label>
            </div>
            <input id="checkIn" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
          </div>

          <div>
            <div className='flex items-center gap-2'>
              <img src={assets.calenderIcon} alt="" className='h-4' />
              <label htmlFor="checkOut">Check out</label>
            </div>
            <input id="checkOut" type="date" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none" />
          </div>

          <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
            <label htmlFor="guests">Guests</label>
            <input min={1} max={500} id="guests" type="number" className=" rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none  max-w-16" placeholder="0" />
          </div>

          <button className='flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1' >
            <img src={assets.searchIcon} alt="searchIcon" className='h-7' />
            <span>Search</span>
          </button>
        </form>

        {/* Dots / indicators */}
        <div className="mt-6 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-3 h-3 rounded-full transition-all ${i === index ? 'scale-125 bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero
