import { useCallback, useEffect, useState } from "react";

// Mini-router sin dependencias: la app solo tiene 4 rutas.
export function usePath(): [string, (path: string) => void] {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to !== window.location.pathname) {
      window.history.pushState(null, "", to);
    }
    setPath(to);
    window.scrollTo({ top: 0 });
  }, []);

  return [path, navigate];
}
