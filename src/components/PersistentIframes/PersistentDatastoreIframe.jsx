import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../layout/Loader";

export default function PersistentDatastoreIframe() {
    const { datastoreVisible, datastoreLoaded } = useSelector((s) => s.iframe);
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
  
    if (!datastoreLoaded || !currentToken) return null;
  
    return (
      <div
        className={`h-[calc(100vh-52px)] ${
          datastoreVisible
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
          title="Datastore"
          src={`https://app-tabix-dev-fe-ancrcgfndfhshyfb.swedencentral-01.azurewebsites.net/#/sql?accessToken=${encodeURIComponent(
            currentToken
          )}&theme=${refreshNonce === "dark" ? "dark" : "light"}`}
          className={`w-full h-full ${isLoading ? 'hidden' : 'block'}`}
          onLoad={() => setIsLoading(false)}
        />
      </div>
    );
  }
  