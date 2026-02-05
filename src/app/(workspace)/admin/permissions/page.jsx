"use client";

import React, { useState } from "react";
import PermissionsContent from "@/components/teams/PermissionsContent";
import UsersList from "@/components/teams/UsersList";

const TeamsPage = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="flex flex-col h-full p-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
        <button
            onClick={() => setActiveTab("users")}
            className={`${
              activeTab === "users"
                ? "border-gray-500 text-gray-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm cursor-pointer`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`${
              activeTab === "teams"
                ? "border-gray-500 text-gray-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-3 px-2 border-b-2 font-medium text-sm cursor-pointer`}
          >
            Teams
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "teams" ? <PermissionsContent /> : <UsersList />}
      </div>
    </div>
  );
};

export default TeamsPage;