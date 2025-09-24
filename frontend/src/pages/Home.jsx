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
        className="w-96 h-auto object-contain" // largeur x3 environ
      />

      <h1 className="text-4xl font-bold text-[#38bdf8]">
        Faîtes en sorte que les opportunités viennent à vous
      </h1>
      <p className="text-gray-300 max-w-xl">
        Cryptos, actions, métaux, monnaies : identifier les actifs les plus prometteurs grâce à un système de notation complet et novateur
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
