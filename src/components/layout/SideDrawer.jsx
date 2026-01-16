"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FunnelSimple,
  SlidersHorizontal,
  Wrench,
  CaretLeft,
  CaretRight,
  CaretDown,
  CaretUp,
  // WechatLogo,
  SignOut,
  UsersThree,
  TreeStructure,
  BookOpen,
} from "@phosphor-icons/react";
import { useSelector } from "react-redux";

// Navigation model (keeps your current routes and labels)
const nav = [
  {
    label: "INTEGRATION",
    href: "/integration",
    icon: FunnelSimple,
    permission: "integration",
  },
  {
    label: "DATA STORE",
    href: "/datastore",
    icon: SlidersHorizontal,
    permission: "datastore",
  },
  {
    label: "COLLECTIONS",
    href: "/collections",
    icon: Wrench,
    permission: "collections",
  },
  {
    label: "DATA LAKEHOUSE",
    icon: TreeStructure,
    isAccordion: true,
    subItems: [
      {
        label: "CODE PAGES",
        href: "/codepages",
        icon: BookOpen,
        permission: "codepages",
      },
      // {
      //   label: "Datalake",
      //   href: "/datalake",
      //   icon: TreeStructure,
      //   permission: "datalake",
      // },
    ],
  },
  // {
  //   label: "AI BOT",
  //   href: "/bot",
  //   icon: WechatLogo,
  // },
  {
    label: "PERMISSIONS",
    href: "/admin/permissions",
    icon: UsersThree,
    permission: "permissions",
  },
];

const SideDrawer = ({ expanded, onToggle }) => {
  const pathname = usePathname();
  const { current: user } = useSelector((state) => state.users);
  const [openAccordion, setOpenAccordion] = useState(null);

  const role = user?.role || null;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const isSuperAdmin = role?.toLowerCase() === "superadmin";

  const allowedNav = isSuperAdmin
    ? nav
    : nav.filter((item) => {
        if (!item.permission) return false;
        return permissions.includes(item.permission);
      });

  // Auto-open accordion if current path matches any sub-item
  useEffect(() => {
    if (!expanded) return;
    
    allowedNav.forEach((item) => {
      if (item.isAccordion && item.subItems) {
        const hasActiveSubItem = item.subItems.some(
          (subItem) =>
            pathname === subItem.href ||
            pathname?.startsWith(subItem.href + "/")
        );
        if (hasActiveSubItem) {
          setOpenAccordion(item.label);
        }
      }
    });
  }, [pathname, expanded]);

  return (
    <>
      {/* Sidebar container */}
      <aside
        className={`fixed left-0 top-13 z-50 h-[calc(100vh-52px)] transition-all duration-300 shadow-[4px_0_6px_-6px_rgba(0,0,0,0.25)] bg-light-theme dark:bg-dark-theme ${
          expanded ? "w-56" : "w-16"
        }`}
      >
        {/* Collapse toggle */}
        <button
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={onToggle}
          className="absolute -right-3 bottom-6 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-light-secondary dark:bg-dark-secondary text-light-main dark:text-dark-main shadow cursor-pointer hover:text-main"
        >
          {expanded ? (
            <CaretLeft className="h-4 w-4" weight="bold" />
          ) : (
            <CaretRight className="h-4 w-4" weight="bold" />
          )}
        </button>

        {/* Nav */}
        <nav className="mt-4 flex flex-col gap-1 justify-between h-[calc(100vh-80px)] px-2">
          <div>
            {allowedNav.map((item) => {
              const IconCmp = item.icon;
              
              // Handle accordion items
              if (item.isAccordion && item.subItems) {
                const isAccordionOpen = openAccordion === item.label;
                const isAnySubItemActive = item.subItems.some((subItem) =>
                  pathname?.startsWith(subItem.href)
                );

                return (
                  <div key={item.label}>
                    {/* Accordion Header */}
                    <button
                      onClick={() => {
                        if (expanded) {
                          setOpenAccordion(isAccordionOpen ? null : item.label);
                        }
                      }}
                      className={`group relative m-1 w-full flex items-center rounded-md p-3 text-sm tracking-wide transition-colors text-light-main dark:text-dark-main ${
                        isAnySubItemActive
                          ? "bg-main shadow-inner text-white"
                          : "hover:bg-main hover:text-white"
                      }`}
                    >
                      <IconCmp
                        className="mr-3 h-5 w-5 shrink-0"
                        weight="regular"
                      />
                      <span
                        className={`whitespace-nowrap cursor-pointer transition-opacity duration-300 ease-in-out flex-1 text-left ${
                          expanded ? "delay-50 opacity-100" : "opacity-0"
                        }`}
                      >
                        {item.label}
                      </span>
                      {expanded &&
                        (isAccordionOpen ? (
                          <CaretUp className="h-4 w-4 shrink-0" weight="bold" />
                        ) : (
                          <CaretDown
                            className="h-4 w-4 shrink-0"
                            weight="bold"
                          />
                        ))}

                      {/* Active bar */}
                      {isAnySubItemActive && (
                        <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-main-light" />
                      )}
                    </button>

                    {/* Accordion Content */}
                    {expanded && isAccordionOpen && (
                      <div className="ml-4 mt-1">
                        {item.subItems.map((subItem) => {
                          const SubIconCmp = subItem.icon;
                          const isSubActive = pathname?.startsWith(
                            subItem.href
                          );

                          return (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              className={`group relative m-1 flex items-center rounded-md p-2 text-xs tracking-wide transition-colors text-light-main dark:text-dark-main ${
                                isSubActive
                                  ? "bg-main/80 shadow-inner text-white"
                                  : "hover:bg-main/60 hover:text-white"
                              }`}
                            >
                              <SubIconCmp
                                className="mr-2 h-4 w-4 shrink-0"
                                weight="regular"
                              />
                              <span className="whitespace-nowrap">
                                {subItem.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Handle regular items
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  className={`group relative m-1 flex items-center rounded-md p-3 text-sm tracking-wide transition-colors text-light-main dark:text-dark-main ${
                    isActive
                      ? "bg-main shadow-inner text-white"
                      : "hover:bg-main hover:text-white"
                  }`}
                >
                  <IconCmp className="mr-3 h-5 w-5 shrink-0" weight="regular" />
                  <span
                    className={`whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                      expanded ? "delay-50 opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active bar */}
                  {isActive && (
                    <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-main-light" />
                  )}
                </Link>
              );
            })}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              // Ensure only this button triggers logout
              window.location.href =
                "https://app.datax.nuvinno.no/.auth/logout";
            }}
            className="cursor-pointer group relative mx-1 flex items-center rounded-md p-3 text-sm tracking-wide transition-colors text-light-main dark:text-dark-main hover:text-main hover:font-semibold"
            aria-label="Logout"
            title="Logout"
          >
            <SignOut size={20} className="mr-3" />
            <span
              className={`whitespace-nowrap transition-opacity duration-300 ease-in-out ${
                expanded ? "delay-50 opacity-100" : "opacity-0"
              }`}
            >
              Logout
            </span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default SideDrawer;
