import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact"; // Import the new Contact page
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// config holds environment constants used across pages

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, location.pathname);
    } else if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token, location]);

  const handleSetToken = (newToken) => {
    setToken(newToken);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/add" replace />
            ) : (
              <Login setToken={handleSetToken} />
            )
          }
        />
        <Route
          path="*"
          element={
            token ? (
              <>
                <Navbar
                  setToken={handleSetToken}
                  setSidebarOpen={setSidebarOpen}
                  sidebarOpen={sidebarOpen}
                />
                <hr />
                <div className="flex w-full">
                  <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
                  <div className="flex-1 mx-auto md:ml-[max(5vw,25px)] my-8 text-gray-600 text-base px-4">
                    <Routes>
                      <Route path="/add" element={<Add token={token} />} />
                      <Route path="/list" element={<List token={token} />} />
                      <Route
                        path="/orders"
                        element={<Orders token={token} />}
                      />
                      <Route
                        path="/categories"
                        element={<Categories token={token} />}
                      />
                      <Route
                        path="/contact"
                        element={<Contact token={token} />}
                      />{" "}
                      {/* Add Contact route */}
                      <Route
                        path="*"
                        element={<Navigate to="/add" replace />}
                      />
                    </Routes>
                  </div>
                </div>
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
