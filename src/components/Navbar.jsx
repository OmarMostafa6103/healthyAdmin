// import React from 'react';
// import { assets } from '../assets/assets';
// import { useNavigate } from 'react-router-dom'; // استيراد useNavigate للتوجيه

// const Navbar = ({ setToken }) => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     setToken(''); // تعيين التوكن إلى قيمة فارغة
//     localStorage.removeItem('token'); // إزالة التوكن من localStorage
//     navigate('/login', { replace: true }); // التوجيه إلى صفحة تسجيل الدخول
//   };

//   return (
//     <div className='flex items-center py-2 px-[4%] justify-between'>
//       <img className='w-[max(10%,80px)]' src={assets.logo} alt="" />
//       <button
//         onClick={handleLogout}
//         className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'
//       >
//         Logout
//       </button>
//     </div>
//   );
// };

// export default Navbar;














import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // استيراد useNavigate و Link للتوجيه

const Navbar = ({ setToken, setSidebarOpen, sidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(''); // تعيين التوكن إلى قيمة فارغة
    localStorage.removeItem('token'); // إزالة التوكن من localStorage
    navigate('/login', { replace: true }); // التوجيه إلى صفحة تسجيل الدخول
  };

  return (
    <div className='flex items-center py-2 px-4 justify-between'>
      <div className='flex items-center gap-3'>
        {/* hamburger for small screens */}
        <button
          aria-label='Toggle sidebar'
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          className='md:hidden p-2 rounded hover:bg-gray-200'
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <Link to="/">
          <h1 className="text-xl md:text-2xl font-bold">
            Luna<span className="text-sm">Helthy</span>
          </h1>
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className='bg-gray-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm'
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;