// "use client";
// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// const IntegrationPage = () => {
//   const [refreshNonce, setRefreshNonce] = useState("light");
//   const { currentToken } = useSelector((state) => state.users);

//   // Reload iframe whenever theme changes
//   useEffect(() => {
//     // Initialize from current saved theme (default to light)
//     const saved = localStorage.getItem("theme");
//     setRefreshNonce(saved === "dark" ? "dark" : "light");

//     const handleThemeChanged = (e) => {
//       const next = e?.detail === "dark" ? "dark" : "light";
//       setRefreshNonce(next);
//     };
//     window.addEventListener("theme-changed", handleThemeChanged);
//     return () =>
//       window.removeEventListener("theme-changed", handleThemeChanged);
//   }, []);

//   return (
//     <div className="h-[calc(100vh-52px)]">
//       <iframe
//         key={`${currentToken}:${refreshNonce}`}
//         title="Integration"
//         src={`https://app-ingest-dev-fe-haamgnfdffe5eedu.swedencentral-01.azurewebsites.net/?accessToken=${encodeURIComponent(
//           currentToken
//         )}&theme=${
//           refreshNonce === "dark" ? "airbyteThemeDark" : "airbyteThemeLight"
//         }`}
//         className="w-full h-full"
//         allowFullScreen
//       />
//     </div>
//   );
// };

// export default IntegrationPage;

export default function IntegrationPage() {
  return null;
}
