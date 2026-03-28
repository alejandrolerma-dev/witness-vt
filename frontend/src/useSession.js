import { useState, useEffect, useCallback } from "react";
import { createSession, setToken, clearToken } from "./api";

const initialState = { sessionId: null, status: "loading", error: null };

export function useSession() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    createSession()
      .then((data) => {
        if (cancelled) return;
        setToken(data.id_token);
        setState({ sessionId: data.session_id, status: "ready", error: null });
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          sessionId: null,
          status: "error",
          error: "Unable to start a secure session. Please refresh the page.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const clearSession = useCallback(() => {
    clearToken();
    setState(initialState);
  }, []);

  return { ...state, clearSession };
}
