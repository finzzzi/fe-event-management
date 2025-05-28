"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-blue-800 p-4 text-white relative">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-3xl font-bold tracking-wider hover:text-blue-200 transition-colors"
        >
          EVENTIO
        </Link>

        {/* desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/login"
            className="font-medium hover:text-blue-200 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="font-medium bg-white text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Register
          </Link>
        </div>

        {/* mobile menu */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white hover:text-blue-200 transition-colors"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-blue-800 border-t border-white shadow-xl">
          <div className="container mx-auto py-3 px-4 flex flex-col space-y-3">
            <Link
              href="/login"
              className="font-medium hover:text-blue-200 transition-colors text-right"
              onClick={toggleMenu}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="font-medium hover:text-blue-200 transition-colors text-right"
              onClick={toggleMenu}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
