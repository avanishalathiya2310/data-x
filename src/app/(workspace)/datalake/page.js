"use client";
import React from "react";
import { useSelector } from "react-redux";

const DatalakePage = () => {
  const { currentToken } = useSelector((state) => state.users);

  return (
    <div className="h-[calc(100vh-52px)]">
      {/* <iframe
        key={`${currentToken}`}
        title="Datalake"
        src={`https://codepage-dev.datax.nuvinno.no/lab?accessToken=${encodeURIComponent(
          currentToken
        )}
          `}
        className="w-full h-full"
        allowFullScreen
      /> */}
    </div>
  );
};

export default DatalakePage;
