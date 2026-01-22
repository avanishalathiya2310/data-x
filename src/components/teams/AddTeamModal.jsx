import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createTeamThunk } from "@/store/teamSlice";

const AddTeamModal = ({ setOpen, onCreated }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canCreate = name.trim().length > 0;

  const handleCreate = (e) => {
    e?.preventDefault();
    if (!canCreate) return;
    setSubmitting(true);
    setError(null);
    dispatch(
      createTeamThunk({
        team_name: name.trim(),
        description: desc.trim(),
      })
    )
      .unwrap()
      .then((created) => {
        onCreated?.(created);
        setOpen(false);
        setName("");
        setDesc("");
      })
      .catch((err) => {
        // Accept server-provided message or error field, else generic
        const msg = typeof err === "string" ? err : (err?.message || err?.error || "Failed to create team");
        setError(msg);
      })
      .finally(() => setSubmitting(false));
  };
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-61 w-full max-w-xl rounded-lg bg-white dark:bg-dark-secondary shadow-xl">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              🧑‍🤝‍🧑
            </span>
            Create a New Team
          </div>
        </div>
        <form onSubmit={handleCreate} className="p-5">
          <label className="block text-sm font-medium mb-1" htmlFor="team_name">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            id="team_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Team Name"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-main"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
            Choose a unique name to identify your team.
          </p>

          <label
            className="block text-sm font-medium mt-4 mb-1"
            htmlFor="team_desc"
          >
            Description (Optional)
          </label>
          <textarea
            id="team_desc"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Write a short description about your team..."
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-main"
          />

          {error && (
            <div className="mt-3 text-sm text-red-600">{error}</div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setName("");
                setDesc("");
              }}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-primary px-4 py-2 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canCreate || submitting}
              className={`rounded-md px-4 py-2 text-sm text-white shadow ${
                canCreate && !submitting
                  ? "bg-[#089bab] hover:bg-[#089bab]/80 cursor-pointer"
                  : "bg-[#089bab]/80 cursor-not-allowed"
              }`}
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamModal;
