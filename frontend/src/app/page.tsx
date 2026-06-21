"use client";

import { useEffect, useState } from "react";
import { useWs } from "@/components/WsProvider";
import { ChatRoom } from "@/components/ChatRoom";

export default function Home() {
  const [roomKey, setRoomKey] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const { userId, connect } = useWs();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.userId) {
            connect(data.userId, data.token || "");
            return;
          }
        }
      } catch (err) {
        // ignore
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [connect]);

  const handleLogin = async (selectedUserId: "Hasi" | "Rudh") => {
    setError("");
    if (!roomKey) {
      setError("Key is required^^");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomKey, userId: selectedUserId }),
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error("Invalid Room Key");
      }
      
      const data = await res.json();
      // Connect WS
      connect(selectedUserId, data.token || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  if (userId) {
    return <ChatRoom />;
  }

  if (isChecking) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-6 bg-[var(--color-bg)] relative overflow-hidden">
        <div className="w-9 h-9 border-[3px] border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin z-10" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 bg-[var(--color-bg)] relative overflow-hidden">

      <div className="z-10 flex flex-col items-center w-full max-w-[22rem] space-y-5 p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-normal leading-tight">Classified conversations</h1>
          <p className="text-[13px] font-medium text-[var(--color-text-muted)]">Top secret</p>
        </div>

        <div className="w-full space-y-3.5">
          <input
            type="password"
            placeholder="Shh..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-center text-base font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-0"
            value={roomKey}
            onChange={(e) => setRoomKey(e.target.value)}
          />
          
          {error && <p className="text-[var(--color-danger)] text-[13px] font-medium text-center">{error}</p>}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleLogin("Hasi")}
              className="bg-[var(--color-surface-raised)] hover:bg-[var(--color-accent-muted)] active:scale-[0.98] transition-all py-3 rounded-lg text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text)] shadow-[var(--shadow-sm)]"
            >
              has
            </button>
            <button
              onClick={() => handleLogin("Rudh")}
              className="bg-[var(--color-surface-raised)] hover:bg-[var(--color-accent-muted)] active:scale-[0.98] transition-all py-3 rounded-lg text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text)] shadow-[var(--shadow-sm)]"
            >
              rud
            </button>
          </div>
        </div>
      </div>

    </main>
  );
}
