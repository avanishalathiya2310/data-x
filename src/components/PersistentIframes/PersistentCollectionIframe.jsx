"use client";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../layout/Loader";

export default function PersistentCollectionsIframe() {
  const { collectionsVisible, collectionsLoaded } = useSelector(
    (s) => s.iframe
  );
  const { currentToken, current: user } = useSelector((s) => s.users);

  const [refreshNonce, setRefreshNonce] = useState("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setRefreshNonce(saved === "dark" ? "dark" : "light");

    const handler = (e) => {
      setRefreshNonce(e?.detail === "dark" ? "dark" : "light");
    };
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  }, []);

  if (!collectionsLoaded || !currentToken || !user) return null;

  return (
    <div
      className={`h-[calc(100vh-52px)] ${
        collectionsVisible
          ? "visible pointer-events-auto"
          : "hidden pointer-events-none"
      }`}
    >
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      )}
      <iframe
        key={`${currentToken}:${refreshNonce}`}
        title="Collections"
        src={`https://ssbi-dev.datax.nuvinno.no/superset/welcome?accessToken=${encodeURIComponent(
          currentToken
        )}&userRole=${user.role}&userId=${user.id}`}
        className={`w-full h-full ${isLoading ? 'hidden' : 'block'}`}
        onLoad={() => setIsLoading(false)}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}
