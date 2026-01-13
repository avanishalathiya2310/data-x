"use client";
import { useSelector } from "react-redux";

export default function PersistentCodepagesIframe() {
  const { codepagesVisible, codepagesLoaded } = useSelector((s) => s.iframe);
  const { currentToken } = useSelector((s) => s.users);

  if (!codepagesLoaded || !currentToken) return null;

  return (
    <div
      className={`h-[calc(100vh-52px)] ${
        codepagesVisible
          ? "visible pointer-events-auto"
          : "hidden pointer-events-none"
      }`}
    >
      <iframe
        title="Codepages"
        src={`https://codepage-dev.datax.nuvinno.no/lab?accessToken=${encodeURIComponent(
          currentToken
        )}`}
        className="w-full h-full"
        allowFullScreen
      />
    </div>
  );
}
