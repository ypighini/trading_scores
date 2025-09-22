import React, { useState, useMemo } from "react";
import { Search, CandlestickChart } from "lucide-react";
import clsx from "clsx";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell
} from "./ui/table";
import { Input } from "./ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

const CryptoTable = ({ cryptos }) => {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "combinedScore", direction: "desc" });
  const [pageUSDT, setPageUSDT] = useState(0);
  const [pageBTC, setPageBTC] = useState(0);
  const [pageInfo, setPageInfo] = useState(0);
  const rowsPerPage = 50;

  // --- Filtrage par recherche
  const filteredCryptos = useMemo(() => {
    return cryptos.filter(
      (c) =>
        (c.code?.toLowerCase().includes(search.toLowerCase()) ||
         c.name?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [cryptos, search]);

  // --- Ajout score combiné
  const withScores = useMemo(() => {
    return filteredCryptos.map((c) => ({
      ...c,
      combinedScore:
        (c.invest_score || 0) +
        (c.swing_score || 0) +
        (c.intraday_score || 0)
    }));
  }, [filteredCryptos]);

  // --- Tri
  const sortedCryptos = useMemo(() => {
    let sortable = [...withScores];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key] || 0;
        const bValue = b[sortConfig.key] || 0;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [withScores, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // --- Filtrage par statut
  const usdtCryptos = sortedCryptos.filter(
    (c) =>
      c.statut === "Traité" &&
      typeof c.code === "string" &&
      c.code.endsWith("/USDT")
  );
  const btcCryptos = sortedCryptos.filter(
    (c) =>
      c.statut === "Traité" &&
      typeof c.code === "string" &&
      c.code.endsWith("/BTC")
  );
  const infoCryptos = sortedCryptos.filter((c) => c.statut !== "Traité");

  // --- Table générique
  const renderTable = (data, page, setPage, showName = true, isInfo = false) => {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const paginated = data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    return (
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {isInfo ? (
                <>
                  <TableHead className="text-left">Code</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center">Dernier score combiné</TableHead>
                </>
              ) : (
                <>
                  <TableHead onClick={() => requestSort("name")} className="text-left">Nom</TableHead>
                  <TableHead onClick={() => requestSort("invest_score")} className="text-center">Investissement</TableHead>
                  <TableHead onClick={() => requestSort("swing_score")} className="text-center">Swing</TableHead>
                  <TableHead onClick={() => requestSort("intraday_score")} className="text-center">Intraday</TableHead>
                  <TableHead onClick={() => requestSort("combinedScore")} className="text-center">Score combiné</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <tbody>
            {paginated.map((crypto, idx) => (
              <TableRow
                key={crypto.code + idx}
                className={clsx(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}
              >
                {isInfo ? (
                  <>
                    <TableCell className="font-medium text-left">{crypto.code || "-"}</TableCell>
                    <TableCell className="text-center">{crypto.statut || "-"}</TableCell>
                    <TableCell
                      className={clsx(
                        "text-center",
                        crypto.combinedScore > 0
                          ? "text-green-600"
                          : crypto.combinedScore < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      )}
                    >
                      {crypto.combinedScore !== 0
                        ? crypto.combinedScore
                        : "Non noté"}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium text-left">{crypto.name || "-"}</TableCell>
                    <TableCell className={clsx("text-center", (crypto.invest_score || 0) > 0 ? "text-green-600" : "text-red-600")}>
                      {crypto.invest_score || 0}
                    </TableCell>
                    <TableCell className={clsx("text-center", (crypto.swing_score || 0) > 0 ? "text-green-600" : "text-red-600")}>
                      {crypto.swing_score || 0}
                    </TableCell>
                    <TableCell className={clsx("text-center", (crypto.intraday_score || 0) > 0 ? "text-green-600" : "text-red-600")}>
                      {crypto.intraday_score || 0}
                    </TableCell>
                    <TableCell className={clsx("text-center", (crypto.combinedScore || 0) > 0 ? "text-green-700 font-bold" : "text-red-700 font-bold")}>
                      {crypto.combinedScore || 0}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </tbody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-2 p-2 text-sm text-gray-600">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Précédent
          </button>
          <span>
            Page {page + 1} / {totalPages}
          </span>
          <button
            disabled={page + 1 === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CandlestickChart className="w-6 h-6 text-blue-600" />
          Tableau de suivi crypto
        </h2>
        <span className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleString()}</span>
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Rechercher une paire..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageUSDT(0);
            setPageBTC(0);
            setPageInfo(0);
          }}
          className="pl-8"
        />
      </div>

      {/* Onglets */}
      <Tabs>
        <TabsList>
          <TabsTrigger>Paires USDT</TabsTrigger>
          <TabsTrigger>Paires BTC</TabsTrigger>
          <TabsTrigger>Informations insuffisantes</TabsTrigger>
        </TabsList>
        <TabsContent index={0}>
          {renderTable(usdtCryptos, pageUSDT, setPageUSDT)}
        </TabsContent>
        <TabsContent index={1}>
          {renderTable(btcCryptos, pageBTC, setPageBTC)}
        </TabsContent>
        <TabsContent index={2}>
          {renderTable(infoCryptos, pageInfo, setPageInfo, false, true)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoTable;
