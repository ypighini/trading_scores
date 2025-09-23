import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cryptos from "./pages/Cryptos";
import Actions from "./pages/Actions";
import { Routes, Route } from "react-router-dom";

const App = () => {
  const [cryptos, setCryptos] = useState([]);

  // Fetch des cryptos une fois au montage
  useEffect(() => {
    fetch("http://127.0.0.1:8000/cryptos")
      .then((res) => res.json())
      .then((data) => setCryptos(data))
      .catch((err) => console.error("Erreur fetch cryptos:", err));
  }, []);

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
