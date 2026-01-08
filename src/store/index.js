"use client";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import teamsReducer from "./teamSlice";
import usersReducer from "./userSlice";
import permissionsReducer from "./permissionSlice";
import React from "react";

export const makeStore = () =>
  configureStore({
    reducer: {
      teams: teamsReducer,
      users: usersReducer,
      permissions: permissionsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  });

export const StoreProvider = ({ children }) => {
  // Create the store once for the lifetime of this provider
  const storeRef = React.useRef();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
};
