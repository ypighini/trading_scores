import React from "react";
import { useNavigate } from "react-router-dom";
import scanpickingBg from "../assets/scanpicking-logo.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row w-full">
      {/* Image verticale à gauche uniquement sur Home */}
      <div className="hidden md:flex md:w-1/2 max-w-1/2">
        <img
          src={scanpickingBg}
          alt="ScanPicking"
          className="w-full object-cover"
          style={{ height: "auto", maxHeight: "100%" }}
        />
      </div>

      {/* Contenu principal à droite */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0f172a] text-[#f1f5f9]">
        <div className="flex flex-col justify-center space-y-6 max-w-xl w-full">
          <h1 className="text-3xl md:text-4xl font-bold text-[#38bdf8] -mt-4">
            Faîtes en sorte que les opportunités viennent à vous
          </h1>
          <p className="text-gray-300 text-base md:text-lg">
            Cryptos, actions, métaux, monnaies : identifiez les actifs les plus
            prometteurs grâce à un système de notation complet et novateur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-2xl transition">
              <h3 className="text-lg md:text-xl font-semibold text-[#38bdf8] mb-2">
                Analyse Crypto
              </h3>
              <p className="text-gray-300 text-sm md:text-base">
                Suivi complet des cryptos avec scoring multi-timeframes et indicateurs avancés.
              </p>
            </div>
            <div className="bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-2xl transition">
              <h3 className="text-lg md:text-xl font-semibold text-[#38bdf8] mb-2">
                Actions & Marchés
              </h3>
              <p className="text-gray-300 text-sm md:text-base">
                Analyse technique des actions PEA et PEA-PME avec visualisation claire et rapide.
              </p>
            </div>
            <div className="bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-2xl transition">
              <h3 className="text-lg md:text-xl font-semibold text-[#38bdf8] mb-2">
                Matières & Forex
              </h3>
              <p className="text-gray-300 text-sm md:text-base">
                Suivi des métaux, matières premières et devises pour une vision complète du marché.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/cryptos")}
            className="mt-4 px-8 py-3 bg-[#38bdf8] text-[#0f172a] font-semibold rounded-lg hover:opacity-90 transition"
          >
            Voir les tableaux
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
