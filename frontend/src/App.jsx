import React, { useEffect, useState } from "react";
import CryptoTable from "./components/CryptoTable";

const App = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch("http://localhost:8000/cryptos"); // ton endpoint backend
        if (!response.ok) throw new Error("Erreur lors de la récupération des cryptos");
        const data = await response.json();
        setCryptos(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  if (loading) return <div>Chargement des cryptos...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tableau Crypto</h1>
      <CryptoTable cryptos={cryptos} />
    </div>
  );
};

export default App;
