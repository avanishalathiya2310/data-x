// "use client";
// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// const DatastorePage = () => {
//   const { currentToken } = useSelector((state) => state.users);
//   const [refreshNonce, setRefreshNonce] = useState("light");

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
//         title="Datastore"
//         src={`https://app-tabix-dev-fe-ancrcgfndfhshyfb.swedencentral-01.azurewebsites.net/#/sql?accessToken=${encodeURIComponent(
//           currentToken
//         )}&theme=${refreshNonce === "dark" ? "dark" : "light"}`}
//         className="w-full h-full"
//         allowFullScreen
//       />
//     </div>
//   );
// };

// export default DatastorePage;


export default function DatastorePage() {
  return null;
}
