"use client";

import { useEffect, useState } from "react";
import { useWs } from "@/components/WsProvider";
import { ChatRoom } from "@/components/ChatRoom";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const { userId, connect } = useWs();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://rudhasi.mooo.com";
        const res = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.userId) {
            connect(data.userId, data.token || "");
            return;
          }
        }
      } catch {
        // ignore
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [connect]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    
    const val = inputValue.toLowerCase().trim();
    let selectedUserId: "Hasi" | "Rudh" | null = null;
    
    if (val === "has" || val === "hasi") {
      selectedUserId = "Hasi";
    } else if (val === "rud" || val === "rudh") {
      selectedUserId = "Rudh";
    }

    if (!selectedUserId) {
      setError("Unrecognized credentials. Please try again.");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://rudhasi.mooo.com";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
        credentials: "include"
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Authentication failed");
      }
      
      const data = await res.json();
      connect(selectedUserId, data.token || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  if (userId) {
    return <ChatRoom />;
  }

  if (isChecking) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-[#030305] relative overflow-hidden">
        <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin z-10" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen relative overflow-hidden bg-[#030305] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Deep background ambient light */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tr from-indigo-900/40 via-purple-900/20 to-transparent blur-[100px]"
        />
        
        {/* Warmer accent light */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 right-1/4 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-bl from-amber-700/20 to-rose-900/10 blur-[80px]"
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-300/10 blur-[1px]"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>

      {/* Premium Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 w-full max-w-[24rem] p-10 mx-4 rounded-[2rem] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),_0_1px_1px_rgba(255,255,255,0.05)_inset] flex flex-col relative overflow-hidden"
      >
        {/* Refined top edge highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-300/20 to-transparent" />

        <div className="text-center mb-10 space-y-2">
          <h1 className="text-[28px] font-medium tracking-tight text-white drop-shadow-sm">
            Sign In
          </h1>
          <p className="text-sm font-medium text-slate-400/80 tracking-wide">
            Access your secure workspace
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <motion.div 
            animate={error ? { x: [-4, 4, -3, 3, -2, 2, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-purple-500/0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
            <input
              type="text"
              placeholder="Enter your credential"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              className="relative w-full bg-[#0a0a0c]/80 border border-white/[0.08] rounded-xl px-5 py-4 text-center text-[15px] font-medium text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-indigo-500/50 focus:bg-[#0f0f13] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </motion.div>
          
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                className="text-rose-400/90 text-[13px] font-medium text-center !mt-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          
          <div className="pt-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="relative w-full overflow-hidden rounded-xl bg-indigo-500 text-white font-medium text-[15px] py-4 transition-all hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] group"
            >
              {/* Button inner shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
              Continue
            </motion.button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
