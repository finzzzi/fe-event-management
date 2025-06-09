"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  User,
  Ticket,
  UserCheck,
  Plus,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

import SearchBar from "./SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserData {
  role: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
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

  // Function to fetch user data
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setUserData(result.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
        } else {
          // fetch user data if token is valid
          await fetchUserData(token);
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

  const handleSwitchRole = async () => {
    if (!token || !userData) return;

    const newRole =
      userData.role === "EventOrganizer" ? "Customer" : "EventOrganizer";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/switch-role`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      if (response.ok) {
        // Update userData with new role
        setUserData((prev) => (prev ? { ...prev, role: newRole } : null));
        setIsOpen(false); // Close mobile menu if open
      } else {
        console.error("Failed to switch role");
      }
    } catch (error) {
      console.error("Error switching role:", error);
    }
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
              <DropdownMenu>
                <DropdownMenuTrigger className="font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                  <Menu size={18} />
                  Menu
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User size={16} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {userData?.role === "EventOrganizer" && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/event"
                        className="flex items-center gap-2"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    {userData?.role === "EventOrganizer" ? (
                      <Link
                        href="/admin/event/create"
                        className="flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Create Event
                      </Link>
                    ) : (
                      <Link href="/ticket" className="flex items-center gap-2">
                        <Ticket size={16} />
                        My Ticket
                      </Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleSwitchRole}
                  >
                    <UserCheck size={16} />
                    {userData?.role === "EventOrganizer"
                      ? "Switch as Customer"
                      : "Switch as Event Organizer"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 focus:text-red-700"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <Link
                  href="/profile"
                  className="font-medium transition-colors text-right flex items-center justify-end gap-2"
                  onClick={toggleMenu}
                >
                  <User size={16} />
                  Profile
                </Link>
                {userData?.role === "EventOrganizer" ? (
                  <Link
                    href="/admin/event/create"
                    className="font-medium transition-colors text-right flex items-center justify-end gap-2"
                    onClick={toggleMenu}
                  >
                    <Plus size={16} />
                    Create Event
                  </Link>
                ) : (
                  <Link
                    href="/ticket"
                    className="font-medium transition-colors text-right flex items-center justify-end gap-2"
                    onClick={toggleMenu}
                  >
                    <Ticket size={16} />
                    My Ticket
                  </Link>
                )}
                <button
                  className="font-medium transition-colors text-right flex items-center justify-end gap-2 cursor-pointer"
                  onClick={handleSwitchRole}
                >
                  <UserCheck size={16} />
                  {userData?.role === "EventOrganizer"
                    ? "Switch as Customer"
                    : "Switch as Event Organizer"}
                </button>
                <hr className="border-white/30" />
                <button
                  onClick={handleLogout}
                  className="font-medium transition-colors text-right text-red-300"
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
