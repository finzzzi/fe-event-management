"use client";

import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

import SearchBar from "./SearchBar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { token, logout, isLoading } = useAuth();

  // Function to decode JWT and check if it's expired
  const isTokenExpired = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Function to verify token with API
  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  };

  // Check token validity on component mount and when token changes
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (token) {
        // check if token is expired locally
        if (isTokenExpired(token)) {
          logout();
          return;
        }

        // verify with API
        const isValid = await verifyToken(token);
        if (!isValid) {
          logout();
        }
      }
    };

    if (!isLoading && token) {
      checkTokenValidity();
    }
  }, [token, isLoading, logout]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false); // Close mobile menu after logout
  };

  if (isLoading) {
    return (
      <nav className="bg-blue-800 p-4 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-3xl font-bold tracking-wider hover:text-blue-200 transition-colors"
          >
            EVENTIO
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-800 p-4 text-white relative shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-3xl font-bold tracking-wider hover:text-blue-200 transition-colors"
        >
          EVENTIO
        </Link>

        {/* Search Bar - Desktop only */}
        <div className="hidden md:block flex-1 max-w-md mx-8 text-black">
          <SearchBar />
        </div>

        {/* desktop menu */}
        <div className="hidden md:flex items-center space-x-6">
          {token ? (
            <>
              <button
                onClick={handleLogout}
                className="font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium transform hover:scale-105 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="font-medium bg-white text-black px-4 py-2 rounded-lg transform hover:scale-105 transition-all duration-200"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile icons search and menu */}
        <div className="md:hidden flex items-center space-x-4">
          <button
            onClick={toggleSearch}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <Search size={24} />
          </button>
          <button
            onClick={toggleMenu}
            className="text-white hover:text-blue-200 transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-blue-800 border-t border-white shadow-xl z-50">
          <div className="container mx-auto p-4">
            <div className="text-black">
              <SearchBar onResultClick={() => setIsSearchOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* show Mobile Menu when click menu icon */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-blue-800 border-t border-white shadow-xl">
          <div className="container mx-auto py-3 px-4 flex flex-col space-y-3">
            {token ? (
              <>
                <button
                  onClick={handleLogout}
                  className="font-medium hover:text-blue-200 transition-colors text-right"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
