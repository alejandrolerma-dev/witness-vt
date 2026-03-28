import * as mock from "./mockApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// In-memory token — never persisted to localStorage or sessionStorage
let _token = null;

export function setToken(token) {
  _token = token;
}

export function getToken() {
  return _token;
}

export function clearToken() {
  _token = null;
}

export class ApiError extends Error {
  constructor(message, status, partial) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (partial !== undefined) {
      this.partial = partial;
    }
  }
}

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    throw new ApiError("Session expired. Please refresh the page.", 401);
  }

  if (response.status === 502) {
    const body = await response.json().catch(() => ({}));
    const err = new ApiError(
      body.error || "AI service temporarily unavailable.",
      502
    );
    if (body.partial !== undefined) {
      err.partial = body.partial;
    }
    throw err;
  }

  if (!response.ok) {
    throw new ApiError("Something went wrong. Please try again.", response.status);
  }

  return response.json();
}

// Named API functions (internal — prefixed with _ for demo-mode delegation)

async function _createSession() {
  return apiFetch("/session", { method: "POST" });
}

async function _processIncident(rawText) {
  return apiFetch("/report/process", {
    method: "POST",
    body: JSON.stringify({ raw_text: rawText }),
  });
}

async function _saveReport(incidentRecord, advice, navigation) {
  return apiFetch("/report/save", {
    method: "POST",
    body: JSON.stringify({ incident_record: incidentRecord, advice, navigation }),
  });
}

async function _retrieveReport(sessionId) {
  return apiFetch(`/report/${sessionId}`, { method: "GET" });
}

// Demo mode — delegate to mock implementations when VITE_DEMO=true
const IS_DEMO = import.meta.env.VITE_DEMO === "true";

export const createSession = IS_DEMO ? mock.createSession : _createSession;
export const processIncident = IS_DEMO ? mock.processIncident : _processIncident;
export const saveReport = IS_DEMO ? mock.saveReport : _saveReport;
export const retrieveReport = IS_DEMO ? mock.retrieveReport : _retrieveReport;
