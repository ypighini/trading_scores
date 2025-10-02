import React, { useState } from "react";
import { CandlestickChart, Info } from "lucide-react";
import CryptoTable from "../components/CryptoTable";

const Cryptos = ({ cryptos }) => {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="p-4">
      {/* Titre centré avec icône */}
      <div className="flex justify-center mb-6 relative">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CandlestickChart className="w-6 h-6 text-blue-400" />
          Tableau de suivi crypto
        </h2>

        {/* Icône Info à droite du titre */}
        <div
          className="absolute right-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-110 transition-transform cursor-pointer"
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
          onClick={() => setShowPopover((prev) => !prev)}
        >
          <Info className="w-4 h-4 text-white" />
        </div>

        {/* Popover premium */}
        {showPopover && (
          <div className="absolute right-0 mt-10 w-80 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg border border-gray-700 z-50 animate-fadeInUp">
            {/* Flèche */}
            <div className="absolute -top-2 right-4 w-3 h-3 bg-gray-900 rotate-45 border-t border-l border-gray-700"></div>

            <strong>Information sur les scores :</strong>
            <p className="mt-1">
              Les scores combinés sont calculés à partir de plusieurs indicateurs techniques (RSI, moyennes mobiles, momentum, Dow Theory, etc.) sur différents timeframes. 
              <br />
              <strong>Investissement :</strong> tendance long terme, 
              <strong> Swing :</strong> moyen terme, 
              <strong> Intraday :</strong> court terme.
              <br />
              Les paires “Informations insuffisantes” n’ont pas pu être entièrement traitées.
            </p>
          </div>
        )}
      </div>

      {/* Tableau principal */}
      <CryptoTable cryptos={cryptos} />

      {/* Animation Tailwind */}
      <style>
        {`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(5px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.25s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default Cryptos;
