"use client";

import React from "react";
import { Plus } from "@phosphor-icons/react";

const TeamsToolbar = ({ onCreate }) => {
  return (
    <div className="flex items-center justify-end mb-4">
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

export default TeamsToolbar;
