import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <div className='bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                <div className='max-w-80'>
                    <img src={assets.logo} alt="logo" className='mb-4 h-8 md:h-9 invert opacity-80' />
                    <p className='text-sm'>
                        14+ years of expertise, offering tailored packages, group adventures, retreats.Safety-first, unforgettable mountain experiences.</p>
                    <div className='flex items-center gap-3 mt-4'>
    <a href="https://www.instagram.com/theholidaycreators/" target="_blank" rel="noopener noreferrer">
        <img src={assets.instagramIcon} alt="instagram-icon" className='w-6 cursor-pointer' />
    </a>

    <a href="https://www.facebook.com/Holidayceators" target="_blank" rel="noopener noreferrer">
        <img src={assets.facebookIcon} alt="facebook-icon" className='w-6 cursor-pointer' />
    </a>

    <a href="https://x.com/Holiday_Creator" target="_blank" rel="noopener noreferrer">
        <img src={assets.twitterIcon} alt="twitter-icon" className='w-6 cursor-pointer' />
    </a>

    <a href="https://www.linkedin.com/company/1860627/admin/dashboard/" target="_blank" rel="noopener noreferrer">
        <img src={assets.linkendinIcon} alt="linkedin-icon" className='w-6 cursor-pointer' />
    </a>
</div>

                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800'>COMPANY</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#">About</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Press</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Partners</a></li>
                    </ul>
                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800'>SUPPORT</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Safety Information</a></li>
                        <li><a href="#">Cancellation Options</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Accessibility</a></li>
                    </ul>
                </div>

                {/* New Contact / Address section */}
                <div className='max-w-80'>
                    <p className='font-playfair text-lg text-gray-800'>CONTACT</p>

                    <div className='mt-3 text-sm'>
                        {/* <p className='font-medium text-gray-700'>Head Office</p> */}
                        <p className='mt-2'>
                            Mirza Kamil Hawal , Srinagar<br />
                            Jammu & Kashmir, 190011,<br />
                            India 
                        </p>

                        <div className='mt-3 flex flex-col gap-2'>
                            <a className='flex items-center gap-2 text-sm hover:underline' href="tel:+91 7006112133 , +91 9906681245">
                                {/* simple phone SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5A2.5 2.5 0 015.5 3h1A2.5 2.5 0 019 5.5v1A2.5 2.5 0 016.5 9H6a12 12 0 0012 12v-.5A2.5 2.5 0 0019.5 18h-1A2.5 2.5 0 0116 15.5v-1" />
                                </svg>
                                +91 7006112133 , +91 9906681245
                            </a>

                            <a className='flex items-center gap-2 text-sm hover:underline' href="mailto:info@theholidaycreators.com">
                                {/* simple mail SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" className='w-4 h-4' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
                                </svg>
                                info@theholidaycreators.com
                            </a>

                            <p className='text-xs text-gray-400'>Office hours: Mon - Sat, 9:00 AM - 6:00 PM</p>
                        </div>
                    </div>
                </div>

                <div className='max-w-80'>
                    <p className='font-playfair text-lg text-gray-800'>STAY UPDATED</p>
                    <p className='mt-3 text-sm'>
                        Subscribe to our newsletter for travel inspiration and special offers.
                    </p>
                    <div className='flex items-center mt-4'>
                        <input type="text" className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none' placeholder='Your email' />
                        <button className='flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r'>
                            <img src={assets.arrowIcon} alt="arrow-icon" className='w-3.5 invert' />
                        </button>
                    </div>
                </div>
            </div>

            <hr className='border-gray-300 mt-8' />
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} The Holiday Creators. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#">Designed & Developed by </a></li>
                    <li><a href="#">Mohammad Haseeb Mir</a></li>
                </ul>
            </div>
        </div>
    )
}

export default Footer;
