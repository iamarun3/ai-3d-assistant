/**
 * hooks/useStore.js
 * React hook for subscribing to the app store.
 */
import { useState, useEffect } from "react";
import { getState, listeners } from "../store/useAppStore.js";

export function useStore(selector) {
  const [slice, setSlice] = useState(() => selector(getState()));

  useEffect(() => {
    const listener = (newState) => {
      const next = selector(newState);
      setSlice((prev) => (prev === next ? prev : next));
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []); // eslint-disable-line

  return slice;
}
