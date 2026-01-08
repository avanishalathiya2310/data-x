export function getApiErrorMessage(err, fallback = "Something went wrong") {
  try {
    if (!err) return fallback;
    // If already a string from rejectWithValue
    if (typeof err === "string") return err;

    // Axios style
    const resp = err.response?.data ?? err.response ?? null;
    const msgFromResp = resp?.message || resp?.error || resp?.msg;
    if (msgFromResp) return String(msgFromResp);

    // Generic Error
    if (err.message) return String(err.message);

    // Fallback
    return fallback;
  } catch (_) {
    return fallback;
  }
}
