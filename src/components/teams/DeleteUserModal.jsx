// src/components/teams/DeleteUserModal.jsx
"use client";

import React, { useState } from "react";
import { X } from "@phosphor-icons/react";

const DeleteUserModal = ({ user, onClose, onConfirm }) => {
  const [deleteText, setDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isDeleteEnabled = deleteText === "Delete";

  const handleDelete = async () => {
    if (!isDeleteEnabled) return;
    
    setIsDeleting(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md rounded-lg bg-white dark:bg-dark-secondary p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Delete User
          </h2>
        </div>

        {/* Warning message */}
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
            ⚠️ Warning: This action cannot be undone
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            If you delete this user, all data related to this user will be
            permanently deleted. This includes:
          </p>
          <ul className="mt-2 ml-4 text-sm text-red-700 dark:text-red-300 list-disc">
            <li>User profile and settings</li>
            <li>All related data and history</li>
          </ul>
        </div>

        {/* User info */}
        <div className="mb-4 rounded-md bg-gray-50 dark:bg-dark-primary p-3 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            User to delete:
          </p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {user.email}
          </p>
          {user.name && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user.name}
            </p>
          )}
        </div>

        {/* Confirmation input */}
        <div className="mb-6">
          <label
            htmlFor="delete-confirmation"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Type <span className="font-bold text-red-600">Delete</span> to
            confirm:
          </label>
          <input
            id="delete-confirmation"
            type="text"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder="Type 'Delete' here"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            autoComplete="off"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-primary/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isDeleteEnabled || isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
