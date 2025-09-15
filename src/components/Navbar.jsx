import PropTypes from "prop-types";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸", short: "EN" },
  { code: "ar", label: "العربية", flag: "��", short: "AR" },
];

export default function Navbar({ setToken, setSidebarOpen, sidebarOpen }) {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (
        open &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const handleLogout = () => {
    setToken && setToken("");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem("i18nextLng", lng);
    } catch (e) {
      // ignore
    }
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    setOpen(false);
  };

  const activeLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div className="flex items-center py-2 px-4 justify-between">
      <div className="flex items-center gap-3">
        <button
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded hover:bg-gray-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20M4 12H20M4 18H20"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Link to="/">
          <h1 className="text-xl md:text-2xl font-bold">
            Luna<span className="text-sm">Helthy</span>
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 border"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="text-lg">🌐</span>
            <span className="ml-1 px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 border">
              {activeLang.short}
            </span>
            <span className="hidden sm:inline ml-2">
              {activeLang.flag} {activeLang.label}
            </span>
            <svg
              className={`w-4 h-4 ml-1 transition-transform ${
                open ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7l5 5 5-5"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {open && (
            <ul
              role="listbox"
              className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50 overflow-hidden"
            >
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => changeLanguage(lang.code)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="flex-1">{lang.label}</span>
                    {i18n.language === lang.code && (
                      <span className="text-blue-600 font-semibold">✓</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm"
        >
          {t ? t("nav.logout") : "Logout"}
        </button>
      </div>
    </div>
  );
}

Navbar.propTypes = {
  setToken: PropTypes.func,
  setSidebarOpen: PropTypes.func,
  sidebarOpen: PropTypes.bool,
};
