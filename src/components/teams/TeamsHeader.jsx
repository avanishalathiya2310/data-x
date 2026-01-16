"use client";

import { Plus } from "@phosphor-icons/react";
import React from "react";

const TeamsHeader = ({ onCreate }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Manage teams and their members
        </p>
      </div>
      <button
        onClick={onCreate}
        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm font-medium bg-white dark:bg-dark-secondary hover:bg-gray-50 dark:hover:bg-dark-secondary/80 shadow-sm"
      >
        <Plus size={16} />
        Create Team
      </button>
    </div>
  );
};

export default TeamsHeader;
