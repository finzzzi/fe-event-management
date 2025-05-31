"use client";

import { useRef, useEffect } from "react";
import { Search, X, Calendar, MapPin, Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEventSearch } from "@/hooks/useEventSearch";
import Link from "next/link";

interface SearchBarProps {
  onResultClick?: () => void;
}

const SearchBar = ({ onResultClick }: SearchBarProps) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    clearSearch,
  } = useEventSearch();

  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handleResultClick = () => {
    setShowResults(false);
    onResultClick?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search event..."
          value={searchQuery}
          onChange={handleInputChange}
          className="pl-10 pr-10 bg-white border-gray-300 "
          onFocus={() => searchQuery && setShowResults(true)}
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Searching event...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="block px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={handleResultClick}
                >
                  <div className="flex flex-col space-y-1">
                    <h4 className="font-medium text-gray-900 line-clamp-1">
                      {event.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-3 w-3 mr-1 " />
                      <span className="text-sm font-medium ">
                        {event.quota} seats left
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="text-gray-400 mb-2">
                <Search className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-500">
                No event found for &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
