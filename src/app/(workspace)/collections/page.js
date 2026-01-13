// "use client";
// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// const collections = () => {
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
//         title="Collections"
//         src={`https://ssbi-dev.datax.nuvinno.no/superset/welcome?accessToken=${encodeURIComponent(
//           currentToken
//         )}`}
//         className="w-full h-full"
//         sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
//       />
//       {/* <iframe
//         key={`${currentToken}:${refreshNonce}`}
//         title="Collections"
//         src={`http://localhost:9000/superset/welcome?accessToken=${encodeURIComponent(
//           currentToken
//         )}`}
//         className="w-full h-full"
//         sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
//       /> */}
//     </div>
//   );
// };

// export default collections;

export default function collections() {
  return null;
}