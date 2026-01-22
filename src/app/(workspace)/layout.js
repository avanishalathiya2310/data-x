"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import SideDrawer from "@/components/layout/SideDrawer";
import { StoreProvider } from "@/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "@/store/userSlice";
import { usePathname, useRouter } from "next/navigation";
import {
  hideCodepages,
  hideCollections,
  hideDatastore,
  hideIntegration,
  showCodepages,
  showCollections,
  showDatastore,
  showIntegration,
} from "@/store/iframeSlice";
import PersistentIntegrationIframe from "@/components/PersistentIframes/PersistentIntegrationIframe";
import PersistentDatastoreIframe from "@/components/PersistentIframes/PersistentDatastoreIframe";
import PersistentCollectionIframe from "@/components/PersistentIframes/PersistentCollectionIframe";
import PersistentCodepagesIframe from "@/components/PersistentIframes/PersistentCodepagesIframe";

const routePermissions = [
  { base: "/integration", permission: "integration" },
  { base: "/datastore", permission: "datastore" },
  { base: "/collections", permission: "collections" },
  { base: "/codepages", permission: "codepages" },
  { base: "/admin/permissions", permission: "permissions" },
  { base: "/admin/teams", permission: "teams" },
];

function LayoutInner({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
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

  useEffect(() => {
    if (pathname?.startsWith("/integration")) {
      dispatch(showIntegration());
      dispatch(hideDatastore());
      dispatch(hideCollections());
      dispatch(hideCodepages());
    } else if (pathname?.startsWith("/datastore")) {
      dispatch(showDatastore());
      dispatch(hideIntegration());
      dispatch(hideCollections());
      dispatch(hideCodepages());
    } else if (pathname?.startsWith("/collections")) {
      dispatch(showCollections());
      dispatch(hideIntegration());
      dispatch(hideDatastore());
      dispatch(hideCodepages());
    } else if (pathname?.startsWith("/codepages")) {
      dispatch(showCodepages());
      dispatch(hideIntegration());
      dispatch(hideDatastore());
      dispatch(hideCollections());
    } else {
      dispatch(hideIntegration());
      dispatch(hideDatastore());
      dispatch(hideCollections());
      dispatch(hideCodepages());
    }
  }, [pathname, dispatch]);

  // Auth & permission checks
  // Show loader while store is fetching OR when nothing is known yet (no user, no token, no error)
  const isLoading =
    !!currentLoading || (!user && !currentToken && !currentError);
  const isAuthenticated = !!(user && currentToken);
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const role = user?.role?.toLowerCase?.() || null;
  const isSuperAdmin = role === "superadmin";
  const isViewer = role === "viewer";
  const isAdmin = role === "admin";
  
  const requiredPermission =
    routePermissions.find((r) => pathname?.startsWith(r.base))?.permission ??
    null;
  
  const hasAnyPermissions = permissions.length > 0;
  const lacksRequired =
    !!requiredPermission && !permissions.includes(requiredPermission);
  
  // Determine if user should be blocked from current route
  let shouldBlock = false;
  let blockMessage = "";
  
  if (isSuperAdmin) {
    // SuperAdmin has access to everything
    shouldBlock = false;
  } else if (isViewer) {
    // Viewer can only access collections if they have the permission
    if (requiredPermission !== "collections" || !permissions.includes("collections")) {
      shouldBlock = true;
      blockMessage = "Viewers can only access the Collections page.";
    }
  } else if (isAdmin) {
    // Admin needs permissions for each route
    if (!hasAnyPermissions || lacksRequired) {
      shouldBlock = true;
      blockMessage = !hasAnyPermissions
        ? "Your account has no permissions assigned. Please contact an administrator."
        : `You do not have the required permission${requiredPermission ? `: ${requiredPermission}` : ""} to access this route.`;
    }
  } else {
    // Regular users need the specific permission
    if (lacksRequired) {
      shouldBlock = true;
      blockMessage = `You do not have the required permission${requiredPermission ? `: ${requiredPermission}` : ""} to access this route.`;
    }
  }
  
  // Get first allowed page for redirect
  const getFirstAllowedPage = () => {
    if (isSuperAdmin) return "/integration";
    
    if (isViewer) {
      return permissions.includes("collections") ? "/collections" : null;
    }
    
    // For admin and regular users, find first page they have permission for
    for (const route of routePermissions) {
      if (permissions.includes(route.permission)) {
        return route.base;
      }
    }
    return null;
  };
  
  // Redirect if blocked
  useEffect(() => {
    if (isAuthenticated && shouldBlock && !isLoading) {
      const firstAllowedPage = getFirstAllowedPage();
      if (firstAllowedPage && pathname !== firstAllowedPage) {
        router.push(firstAllowedPage);
      }
    }
  }, [isAuthenticated, shouldBlock, isLoading, pathname]);

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
                <p className="mb-2 font-medium">Access Denied</p>
                <p className="mb-4 text-sm opacity-80">
                  {blockMessage || "You do not have permission to access this page."}
                </p>
                <p className="text-xs opacity-60">Redirecting to your allowed page...</p>
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
      <LayoutInner>
        <PersistentIntegrationIframe />
        <PersistentDatastoreIframe />
        <PersistentCollectionIframe />
        <PersistentCodepagesIframe />
        {children}
      </LayoutInner>
    </StoreProvider>
  );
};

export default layout;
