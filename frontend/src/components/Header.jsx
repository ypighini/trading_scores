import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-gray-900 text-white shadow-md w-full">
      <div className="flex items-center justify-between container mx-auto py-4 px-6">
        {/* Home icon collé à gauche */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-4xl hover:text-blue-400 transition-colors">
            🏠
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
        </nav>

        {/* Liens à droite */}
        <div className="flex space-x-6">
          <Link to="/login" className="hover:text-blue-400 transition-colors">
            Login
          </Link>
          <Link to="/register" className="hover:text-blue-400 transition-colors">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
