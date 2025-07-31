import { useCallback, useState } from "react";

export default function useVote() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL 

  const sendVote = useCallback(async ({ id, model_id, condition_id }) => {
    setSending(true);
    setError(null);


    try {
      const res = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, model_id, condition_id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al registrar el voto.");
      }
    } catch (err) {
      console.error("❌ Error al enviar voto:", err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  }, []);

  return { sendVote, sending, error };
}
