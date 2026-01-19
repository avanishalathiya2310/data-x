"use client";
import { useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../layout/Loader";

export default function PersistentCodepagesIframe() {
  const { codepagesVisible, codepagesLoaded } = useSelector((s) => s.iframe);
  const { currentToken } = useSelector((s) => s.users);
  const [isLoading, setIsLoading] = useState(true);

  if (!codepagesLoaded || !currentToken) return null;

  return (
    <div
      className={`h-[calc(100vh-52px)] ${
        codepagesVisible
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
        title="Codepages"
        src={`https://codepage-dev.datax.nuvinno.no/lab?accessToken=${encodeURIComponent(
          currentToken
        )}`}
        className={`w-full h-full ${isLoading ? 'hidden' : 'block'}`}
        onLoad={() => setIsLoading(false)}
        allowFullScreen
      />
    </div>
  );
}
