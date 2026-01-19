import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../layout/Loader";

export default function PersistentIntegrationIframe() {
  const { ingestVisible, ingestLoaded } = useSelector((s) => s.iframe);
  const { currentToken } = useSelector((s) => s.users);
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

  if (!ingestLoaded || !currentToken) return null;

  return (
    <div
      className={`h-[calc(100vh-52px)] ${
        ingestVisible
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
        title="Integration"
        src={`https://app-ingest-dev-fe-haamgnfdffe5eedu.swedencentral-01.azurewebsites.net/?accessToken=${encodeURIComponent(
          currentToken
        )}&theme=${
          refreshNonce === "dark" ? "airbyteThemeDark" : "airbyteThemeLight"
        }`}
        className={`w-full h-full ${isLoading ? 'hidden' : 'block'}`}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
