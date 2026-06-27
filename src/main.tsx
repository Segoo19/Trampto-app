import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// Recuperación automática tras un redeploy: si un chunk dinámico (pdf-lib,
// jszip…) ya no existe porque cambió de hash, el navegador no puede importarlo.
// Recargamos una vez para coger la versión nueva (con guard anti-bucle).
window.addEventListener("vite:preloadError", () => {
  const KEY = "trampto-preload-reload";
  const last = Number(sessionStorage.getItem(KEY) || 0);
  if (Date.now() - last > 10000) {
    sessionStorage.setItem(KEY, String(Date.now()));
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
