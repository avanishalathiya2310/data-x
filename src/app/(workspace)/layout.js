"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import SideDrawer from "@/components/layout/SideDrawer";
import { StoreProvider } from "@/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "@/store/userSlice";
import { usePathname } from "next/navigation";

const routePermissions = [
  { base: "/integration", permission: "integration" },
  { base: "/datastore", permission: "datastore" },
  { base: "/collections", permission: "collections" },
  { base: "/codepages", permission: "codepages" },
  { base: "/admin/teams", permission: "teams" },
];

function LayoutInner({ children }) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(true);
  const {
    current: user,
    currentToken,
    currentLoading,
    currentError,
  } = useSelector((state) => state.users || {});

  // Fetch user/token on initial mount if missing
  useEffect(() => {
    if (!user || !currentToken) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user, currentToken]);

  const pathname = usePathname();

  // Auth & permission checks
  // Show loader while store is fetching OR when nothing is known yet (no user, no token, no error)
  const isLoading =
    !!currentLoading || (!user && !currentToken && !currentError);
  const isAuthenticated = !!(user && currentToken);
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const requiredPermission =
    routePermissions.find((r) => pathname?.startsWith(r.base))?.permission ??
    null;
  // Admin-specific enforcement
  const isAdmin = user?.role?.toLowerCase?.() === "admin";
  const hasAnyPermissions = permissions.length > 0;
  const lacksRequired =
    !!requiredPermission && !permissions.includes(requiredPermission);
  // Block if admin has no permissions, or admin lacks the required permission for the route
  const shouldBlock = isAdmin && (!hasAnyPermissions || lacksRequired);

  return (
    <>
      <Header />
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-300">
          Loading...
        </div>
      ) : !isAuthenticated ? (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md p-6 max-w-lg text-center">
            <p className="mb-2 font-medium">You cannot access this.</p>
            {currentError && (
              <p className="mb-4 text-sm opacity-80">{String(currentError)}</p>
            )}
            <button
              onClick={() => dispatch(fetchCurrentUser())}
              className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <SideDrawer
            expanded={expanded}
            onToggle={() => setExpanded((s) => !s)}
          />
          {shouldBlock ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md p-6 max-w-lg text-center">
                <p className="mb-2 font-medium">Access restricted for admin.</p>
                {!hasAnyPermissions ? (
                  <p className="mb-4 text-sm opacity-80">
                    Your account has no permissions assigned. Please contact an
                    administrator.
                  </p>
                ) : (
                  lacksRequired && (
                    <p className="mb-4 text-sm opacity-80">
                      You do not have the required permission
                      {requiredPermission ? `: ${requiredPermission}` : ""} to
                      access this route.
                    </p>
                  )
                )}
              </div>
            </div>
          ) : (
            <div
              className={`transition-[margin] duration-300 ${
                expanded ? "ml-56" : "ml-16"
              }`}
            >
              <main className="bg-white dark:bg-dark-primary text-black dark:text-white h-[calc(100vh-52px)]">
                {children}
              </main>
            </div>
          )}
        </>
      )}
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

const layout = ({ children }) => {
  return (
    <StoreProvider>
      <LayoutInner>{children}</LayoutInner>
    </StoreProvider>
  );
};

export default layout;
