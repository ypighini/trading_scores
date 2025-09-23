import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"; // chemin relatif vers ton ui/tabs

const CryptoTable = ({ cryptos = [], lastUpdate = null }) => {
  const [sortConfig, setSortConfig] = useState({ key: "combinedScore", direction: "desc" });
  const [pageUSDT, setPageUSDT] = useState(0);
  const [pageBTC, setPageBTC] = useState(0);
  const [pageInfo, setPageInfo] = useState(0);
  const [searchUSDT, setSearchUSDT] = useState("");
  const [searchBTC, setSearchBTC] = useState("");
  const [searchInfo, setSearchInfo] = useState("");
  const rowsPerPage = 50;

  const prepareData = (data, searchTerm) => {
    const term = searchTerm.trim().toLowerCase();
    let filtered = Array.isArray(data) ? data : [];
    if (term) {
      filtered = filtered.filter(
        (c) =>
          (c.code && String(c.code).toLowerCase().includes(term)) ||
          (c.name && String(c.name).toLowerCase().includes(term))
      );
    }

    return filtered.map((c) => ({
      ...c,
      invest_score: Number(c.invest_score || 0),
      swing_score: Number(c.swing_score || 0),
      intraday_score: Number(c.intraday_score || 0),
      combinedScore:
        Number(c.invest_score || 0) +
        Number(c.swing_score || 0) +
        Number(c.intraday_score || 0),
    }));
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const renderTable = (data, page, setPage, searchTerm, setSearch, isInfo = false) => {
    const sorted = useMemo(() => {
      const arr = [...prepareData(data, searchTerm)];
      if (!sortConfig.key) return arr;
      arr.sort((a, b) => {
        const aV = a[sortConfig.key] ?? 0;
        const bV = b[sortConfig.key] ?? 0;
        if (aV < bV) return sortConfig.direction === "asc" ? -1 : 1;
        if (aV > bV) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
      return arr;
    }, [data, searchTerm, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
    const pageSafe = Math.min(page, Math.max(0, totalPages - 1));
    const paginated = sorted.slice(pageSafe * rowsPerPage, (pageSafe + 1) * rowsPerPage);

    return (
      <div>
        {/* Recherche spécifique à ce tableau */}
        <div className="w-full sm:w-80 mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Rechercher une paire..."
              className="pl-10 pr-3 py-2 rounded bg-gray-800 text-white w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-sm mt-2">
          <table className="min-w-[700px] w-full">
            <thead>
              <tr className="bg-gray-800 text-gray-100 font-bold text-lg">
                {isInfo ? (
                  <>
                    <th className="text-left px-4 py-3">Code</th>
                    <th className="text-center px-4 py-3">Statut</th>
                    <th className="text-center px-4 py-3">Score combiné</th>
                  </>
                ) : (
                  <>
                    <th
                      onClick={() => requestSort("name")}
                      className="text-left px-4 py-3 cursor-pointer"
                    >
                      Nom
                    </th>
                    <th
                      onClick={() => requestSort("invest_score")}
                      className="text-center px-4 py-3 cursor-pointer"
                    >
                      Investissement
                    </th>
                    <th
                      onClick={() => requestSort("swing_score")}
                      className="text-center px-4 py-3 cursor-pointer"
                    >
                      Swing
                    </th>
                    <th
                      onClick={() => requestSort("intraday_score")}
                      className="text-center px-4 py-3 cursor-pointer"
                    >
                      Intraday
                    </th>
                    <th
                      onClick={() => requestSort("combinedScore")}
                      className="text-center px-4 py-3 cursor-pointer"
                    >
                      Score combiné
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, idx) => (
                <tr
                  key={(c.code ?? c.name ?? idx) + idx}
                  className={clsx(
                    idx % 2 === 0
                      ? "bg-gray-900 text-gray-100"
                      : "bg-gray-800 text-gray-100"
                  )}
                >
                  {isInfo ? (
                    <>
                      <td className="px-4 py-3">{c.code ?? "-"}</td>
                      <td className="text-center px-4 py-3">{c.statut ?? "-"}</td>
                      <td
                        className={clsx(
                          "text-center px-4 py-3 font-bold",
                          c.combinedScore > 0
                            ? "text-green-500"
                            : c.combinedScore < 0
                            ? "text-red-500"
                            : "text-gray-400"
                        )}
                      >
                        {c.combinedScore ?? 0}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{c.name ?? c.code ?? "-"}</td>
                      <td
                        className={clsx(
                          "text-center px-4 py-3 font-semibold",
                          (c.invest_score || 0) > 0
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {c.invest_score ?? 0}
                      </td>
                      <td
                        className={clsx(
                          "text-center px-4 py-3 font-semibold",
                          (c.swing_score || 0) > 0
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {c.swing_score ?? 0}
                      </td>
                      <td
                        className={clsx(
                          "text-center px-4 py-3 font-semibold",
                          (c.intraday_score || 0) > 0
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {c.intraday_score ?? 0}
                      </td>
                      <td
                        className={clsx(
                          "text-center px-4 py-3 font-bold",
                          (c.combinedScore || 0) > 0
                            ? "text-green-400"
                            : "text-red-400"
                        )}
                      >
                        {c.combinedScore ?? 0}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-3 p-2 text-sm gap-2">
            <div className="flex gap-2 items-center">
              <button
                disabled={pageSafe === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className="px-3 py-1 rounded bg-gray-700 text-white font-bold disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                disabled={pageSafe + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                className="px-3 py-1 rounded bg-gray-700 text-white font-bold disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="text-white font-bold">
              Page {pageSafe + 1} / {totalPages}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fonction utilitaire : trouver la date max dans cryptos
  const getMaxLastUpdated = () => {
    if (!Array.isArray(cryptos) || cryptos.length === 0) return null;
    const timestamps = cryptos
      .map((c) => (c.last_updated ? new Date(c.last_updated).getTime() : null))
      .filter((t) => t && !Number.isNaN(t));
    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps)).toLocaleString();
  };

  const last = getMaxLastUpdated() || lastUpdate || "—";

  // Filtrage des données par onglet
  const usdtData = cryptos.filter(
    (c) => c.statut === "Traité" && typeof c.code === "string" && c.code.endsWith("/USDT")
  );
  const btcData = cryptos.filter(
    (c) => c.statut === "Traité" && typeof c.code === "string" && c.code.endsWith("/BTC")
  );
  const infoData = cryptos.filter((c) => c.statut !== "Traité");

  return (
    <div className="p-4">
      <Tabs defaultValue={0}>
        <TabsList
          className="flex justify-between items-center mb-2"
          right={<div className="text-white font-bold">Dernière mise à jour : {last}</div>}
        >
          <TabsTrigger index={0} className="text-white font-bold text-lg">
            Paires USDT
          </TabsTrigger>
          <TabsTrigger index={1} className="text-white font-bold text-lg">
            Paires BTC
          </TabsTrigger>
          <TabsTrigger index={2} className="text-white font-bold text-lg">
            Informations insuffisantes
          </TabsTrigger>
        </TabsList>

        <TabsContent index={0}>
          {renderTable(usdtData, pageUSDT, setPageUSDT, searchUSDT, setSearchUSDT)}
        </TabsContent>
        <TabsContent index={1}>
          {renderTable(btcData, pageBTC, setPageBTC, searchBTC, setSearchBTC)}
        </TabsContent>
        <TabsContent index={2}>
          {renderTable(infoData, pageInfo, setPageInfo, searchInfo, setSearchInfo, true)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoTable;
