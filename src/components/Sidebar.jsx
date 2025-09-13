import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = ({ open, setOpen }) => {
    return (
        <>
            {/* Desktop sidebar */}
            <aside className='hidden md:block w-56 min-h-screen border-r-2 bg-white'>
                <div className='flex flex-col gap-4 pt-6 px-4 text-sm'>
                    <NavLink className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/add'>
                        <img className='w-5 h-5' src={assets.add_icon} alt="" />
                        <p className=''>Add Items</p>
                    </NavLink>

                    <NavLink className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/list'>
                        <img className='w-5 h-5' src={assets.order_icon} alt="" />
                        <p className=''>List Items</p>
                    </NavLink>

                    <NavLink className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/orders'>
                        <img className='w-5 h-5' src={assets.order_icon} alt="" />
                        <p className=''>Orders</p>
                    </NavLink>

                    <NavLink className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/categories'>
                        <img className='w-5 h-5' src={assets.order_icon} alt="" />
                        <p className=''>Categories</p>
                    </NavLink>

                    <NavLink className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/contact'>
                        <img className='w-5 h-5' src={assets.order_icon} alt="" />
                        <p className=''>Contact Messages</p>
                    </NavLink>
                </div>
            </aside>

            {/* Mobile drawer */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r-2 transition-transform duration-200 ease-in-out md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`} role="dialog" aria-modal={open}>
                <div className='flex items-center justify-between px-4 py-3 border-b'>
                    <h3 className='font-semibold'>Menu</h3>
                    <button aria-label='Close menu' onClick={() => setOpen && setOpen(false)} className='p-2 rounded hover:bg-gray-100'>✕</button>
                </div>
                <div className='flex flex-col gap-3 pt-4 px-4 text-sm'>
                    <NavLink onClick={() => setOpen && setOpen(false)} className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/add'>
                        <img className='w-5 h-5' src={assets.add_icon} alt="" />
                        <p>Add Items</p>
                    </NavLink>

                    <NavLink onClick={() => setOpen && setOpen(false)} className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/list'>
                        <img className='w-5 h-5' src={assets.order_icon} alt="" />
                        <p>List Items</p>
                    </NavLink>

                    <NavLink onClick={() => setOpen && setOpen(false)} className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/orders'>
                        <img className='w-5 h-5' src={assets.order_icon} alt="" />
                        <p>Orders</p>
                    </NavLink>

                    <NavLink onClick={() => setOpen && setOpen(false)} className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/categories'>
                        <img className='w-5 h-5' src={assets.order_icon} alt="" />
                        <p>Categories</p>
                    </NavLink>

                    <NavLink onClick={() => setOpen && setOpen(false)} className='flex items-center gap-3 px-3 py-3 rounded hover:bg-gray-50' to='/contact'>
                        <img className='w-5 h-5' src={assets.order_icon} alt="" />
                        <p>Contact Messages</p>
                    </NavLink>
                </div>
            </div>

            {/* Bottom nav for very small screens */}
            <nav className='fixed bottom-0 left-0 right-0 bg-white border-t md:hidden flex justify-around py-2'>
                <NavLink to='/add' className='flex flex-col items-center text-xs'>
                    <img className='w-5 h-5' src={assets.add_icon} alt="" />
                    <span className='text-[10px]'>Add</span>
                </NavLink>
                <NavLink to='/list' className='flex flex-col items-center text-xs'>
                    <img className='w-5 h-5' src={assets.order_icon} alt="" />
                    <span className='text-[10px]'>List</span>
                </NavLink>
                <NavLink to='/orders' className='flex flex-col items-center text-xs'>
                    <img className='w-5 h-5' src={assets.order_icon} alt="" />
                    <span className='text-[10px]'>Orders</span>
                </NavLink>
            </nav>
        </>
    );
};

export default Sidebar;