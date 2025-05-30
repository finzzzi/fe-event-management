import { useState, useEffect, useCallback } from "react";
import { Event } from "@/types/event";

export const useEventSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search events function
  const searchEvents = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/all?q=${encodeURIComponent(
          query
        )}`
      );
      const data: Event[] = await res.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to search events:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Effect to search when debounced query changes
  useEffect(() => {
    searchEvents(debouncedQuery);
  }, [debouncedQuery, searchEvents]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showResults,
    setShowResults,
    clearSearch,
  };
};
