import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cryptos from "./pages/Cryptos";
import Actions from "./pages/Actions";
import { Routes, Route } from "react-router-dom";

const App = () => {
  const [cryptos, setCryptos] = useState([]);

  // Récupération de l'URL de l'API depuis le .env
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // Fetch des cryptos une fois au montage
  useEffect(() => {
    fetch(`${API_URL}/cryptos`)
      .then((res) => res.json())
      .then((data) => setCryptos(data))
      .catch((err) => console.error("Erreur fetch cryptos:", err));
  }, [API_URL]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-[#f1f5f9] font-inter">
      <Header />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cryptos" element={<Cryptos cryptos={cryptos} />} />
          <Route path="/actions" element={<Actions />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
