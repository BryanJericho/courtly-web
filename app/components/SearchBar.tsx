// components/SearchBar.tsx

import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar: React.FC = () => {
  return (
    // Memastikan lebar penuh dan padding yang sesuai
    <div className="container mx-auto px-4 relative z-20 pt-24">
      <div className="bg-white p-2 rounded-xl shadow-lg flex items-center border border-gray-300">
        <FaSearch className="text-gray-500 ml-3" />
        <input
          type="text"
          placeholder="Pencarian"
          className="flex-grow p-3 rounded-xl focus:outline-none placeholder-gray-500"
        />
        {/* Ikon Filter di kanan (Gantilah dengan ikon yang sesuai) */}
        <div className="p-2 cursor-pointer">
          {/* Anggap ini adalah ikon filter atau panah */}
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4h18M3 8h18m-6 4h6m-6 4h6m-9 4h9"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
