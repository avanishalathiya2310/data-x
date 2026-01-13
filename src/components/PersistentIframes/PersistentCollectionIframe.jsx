"use client";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function PersistentCollectionsIframe() {
  const { collectionsVisible, collectionsLoaded } = useSelector(
    (s) => s.iframe
  );
  const { currentToken } = useSelector((s) => s.users);
  const [refreshNonce, setRefreshNonce] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setRefreshNonce(saved === "dark" ? "dark" : "light");

    const handler = (e) => {
      setRefreshNonce(e?.detail === "dark" ? "dark" : "light");
    };
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  }, []);

  if (!collectionsLoaded || !currentToken) return null;

  return (
    <div
      className={`h-[calc(100vh-52px)] ${
        collectionsVisible
          ? "visible pointer-events-auto"
          : "hidden pointer-events-none"
      }`}
    >
      <iframe
        key={`${currentToken}:${refreshNonce}`}
        title="Collections"
        src={`https://ssbi-dev.datax.nuvinno.no/superset/welcome?accessToken=${encodeURIComponent(
          currentToken
        )}`}
        className="w-full h-full"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}
