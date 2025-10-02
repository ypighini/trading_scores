import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#1e293b] text-sm py-3 text-center text-gray-400 flex-shrink-0">
      <div>
        © 2025 ScanPicking – Tous droits réservés
      </div>
      <div className="space-x-3 mt-1">
        <Link to="/contact" className="hover:text-white">Contact</Link> | 
        <Link to="/mentions-legales" className="hover:text-white">Mentions légales</Link> | 
        <Link to="/politique-confidentialite" className="hover:text-white">Politique de confidentialité</Link> | 
        <Link to="/cgu" className="hover:text-white">CGU & CGV</Link> | 
        <Link to="/disclaimer" className="hover:text-white">Disclaimer</Link>
      </div>
    </footer>
  );
};

export default Footer;
