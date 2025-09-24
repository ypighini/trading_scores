import React, { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Cryptos from "./pages/Cryptos.jsx";
import Actions from "./pages/Actions.jsx";
import { Routes, Route, useLocation } from "react-router-dom";

const App = () => {
  const [cryptos, setCryptos] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const location = useLocation();

  useEffect(() => {
    fetch(`${API_URL}/cryptos`)
      .then((res) => res.json())
      .then((data) => setCryptos(data))
      .catch((err) => console.error("Erreur fetch cryptos:", err));
  }, [API_URL]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-[#f1f5f9] font-inter">
      <Header />

      <main className="flex-1 flex flex-col">
        {location.pathname === "/" ? (
          <Home />
        ) : (
          <div className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/cryptos" element={<Cryptos cryptos={cryptos} />} />
              <Route path="/actions" element={<Actions />} />
            </Routes>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
