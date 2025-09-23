import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/scanpicking-logo.png"; // ✅ Assure-toi que le logo est dans src/assets

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-6">
      {/* Logo en haut */}
      <img
        src={logo}
        alt="ScanPicking Logo"
        className="w-72 h-auto object-contain" // largeur x3 environ
      />

      <h1 className="text-4xl font-bold text-[#38bdf8]">
        Analyse multi-timeframes pour Cryptos & Actions
      </h1>
      <p className="text-gray-300 max-w-xl">
        Suivez facilement les scores combinés, tendances et divergences RSI sur toutes vos cryptos et actions favorites.
      </p>
      <button
        onClick={() => navigate("/cryptos")}
        className="px-6 py-3 bg-[#38bdf8] text-[#0f172a] font-semibold rounded hover:opacity-90 transition"
      >
        Voir les tableaux
      </button>
    </div>
  );
};

export default Home;
