import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReactCountryFlag from "react-country-flag";
import logo from "../assets/logo.png"; // Assure-toi que le chemin est correct

export default function Header() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("FR");
  const dropdownRef = useRef(null);

  const flags = {
    FR: { code: "FR", label: "Français" },
    EN: { code: "GB", label: "English" },
    ES: { code: "ES", label: "Español" },
  };

  const handleLanguageChange = (lng) => {
    setLang(lng);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-900 text-white w-full relative">
      <div className="flex items-center justify-between w-full py-3 px-6 md:px-8">
        
        {/* Logo totalement à gauche */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="ScanPicking Logo"
              className="h-10 w-auto object-contain" // Hauteur fixe pour ne pas changer la taille du header
            />
          </Link>
        </div>

        {/* Navigation centrée */}
        <nav className="flex-1 flex justify-center space-x-8 text-lg font-semibold">
          <Link to="/cryptos" className="hover:text-blue-400 transition-colors">
            Cryptos
          </Link>
          <Link to="/actions" className="hover:text-blue-400 transition-colors">
            Actions
          </Link>
          <Link to="/metaux" className="hover:text-blue-400 transition-colors">
            Métaux
          </Link>
          <Link to="/matieres" className="hover:text-blue-400 transition-colors">
            Matières Premières
          </Link>
          <Link to="/forex" className="hover:text-blue-400 transition-colors">
            Forex
          </Link>
        </nav>

        {/* Zone droite */}
        <div className="flex items-center space-x-6 relative flex-shrink-0">

          {/* Sélecteur langue */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-2 px-3 py-1 border border-gray-600 rounded-md hover:border-blue-400 transition"
            >
              <ReactCountryFlag
                countryCode={flags[lang].code}
                svg
                style={{ width: "1.5em", height: "1.5em" }}
              />
              <span>{lang}</span>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20">
                {Object.keys(flags).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => handleLanguageChange(lng)}
                    className="flex items-center space-x-2 px-4 py-2 w-full text-left hover:bg-gray-700"
                  >
                    <ReactCountryFlag
                      countryCode={flags[lng].code}
                      svg
                      style={{ width: "1.5em", height: "1.5em" }}
                    />
                    <span>{flags[lng].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bouton Connexion totalement à droite */}
          <Link
            to="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-md transition"
          >
            Connexion
          </Link>
        </div>
      </div>

      {/* Barre dégradée stylée sous le header */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 shadow-lg rounded-b-lg"></div>
    </header>
  );
}
