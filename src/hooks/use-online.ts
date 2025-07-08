"use client";

import { useState, useEffect } from "react";

export function useOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
