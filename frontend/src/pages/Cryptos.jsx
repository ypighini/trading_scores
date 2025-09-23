import React from "react";
import { CandlestickChart } from "lucide-react"; // ⚠️ Important : import de l'icône
import CryptoTable from "../components/CryptoTable";

const Cryptos = ({ cryptos }) => {
  return (
    <div className="p-4">
      {/* Titre centré avec icône */}
      <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-6">
        <CandlestickChart className="w-6 h-6 text-blue-400" />
        Tableau de suivi crypto
      </h2>

      {/* Tableau principal */}
      <CryptoTable cryptos={cryptos} />
    </div>
  );
};

export default Cryptos;
