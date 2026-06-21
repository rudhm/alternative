"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { useWs } from "@/components/WsProvider";
import { ChatRoom } from "@/components/ChatRoom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Sparkles } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

const GREETINGS = ["We missed you", "Welcome back", "Hello again", "Just the two of us"];

// Canvas Starfield Component
const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; r: number; opacity: number; speed: number; pulse: number }[] = [];
    let shootingStars: { x: number; y: number; len: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 4000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.5,
          opacity: Math.random(),
          speed: Math.random() * 0.05 + 0.01,
          pulse: Math.random() * 0.05 + 0.01,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Twinkling background stars
      stars.forEach((s) => {
        s.opacity += s.pulse;
        if (s.opacity > 1 || s.opacity < 0.2) s.pulse = -s.pulse;
        s.y -= s.speed;
        if (s.y < 0) {
          s.y = canvas.height;
          s.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 240, ${s.opacity * 0.7})`;
        ctx.fill();
      });

      // Occasional shooting stars
      if (Math.random() < 0.01) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: 0,
          len: Math.random() * 80 + 20,
          speed: Math.random() * 10 + 10,
          opacity: 1,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x -= ss.speed;
        ss.y += ss.speed;
        ss.opacity -= 0.02;

        if (ss.opacity <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x + ss.len, ss.y - ss.len);
        ctx.strokeStyle = `rgba(255, 230, 250, ${ss.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const { userId, connect } = useWs();

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIdx((prev) => (prev + 1) % GREETINGS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const handleLogin = async (e?: FormEvent) => {
    e?.preventDefault();
    setError("");

    const val = inputValue.toLowerCase().trim();
    if (!val) {
      setError("Please enter your name.");
      setShakeKey((k) => k + 1);
      return;
    }

    let selectedUserId: "Hasi" | "Rudh" | null = null;
    
    if (val === "has" || val === "hasi") {
      selectedUserId = "Hasi";
    } else if (val === "rud" || val === "rudh") {
      selectedUserId = "Rudh";
    }

    if (!selectedUserId) {
      setError("I don't recognize that whisper...");
      setShakeKey((k) => k + 1);
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
        throw new Error("Authentication failed");
      }
      
      const data = await res.json();
      connect(selectedUserId, data.token || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setShakeKey((k) => k + 1);
    }
  };

  if (userId) {
    return <ChatRoom />;
  }

  if (isChecking) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-[#07050e] relative overflow-hidden">
        <div className="w-10 h-10 border-[3px] border-rose-500/20 border-t-rose-400 rounded-full animate-spin z-10" />
      </main>
    );
  }

  const titleChars = Array.from("Classified");

  return (
    <main className={`flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-[#07050e] text-slate-100 ${inter.className}`}>
      
      {/* Texture Grain */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* Nebula Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Deep Plum */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4], x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-purple-900/50 to-transparent blur-[120px]"
        />
        {/* Violet */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 right-1/4 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-bl from-violet-700/40 to-transparent blur-[100px]"
        />
        {/* Amber */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15], x: [0, -40, 0], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-1/4 left-1/4 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-amber-600/20 to-rose-900/10 blur-[100px]"
        />
      </div>

      <Starfield />

      {/* Inner Glow Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 w-full max-w-[24rem] p-10 mx-4 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6),_0_0_40px_rgba(244,63,94,0.05)_inset] flex flex-col relative"
      >
        {/* Decorative Monogram */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#120e1c] border border-rose-400/20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.15)] z-20">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Lock size={16} className="text-rose-300/80" />
          </motion.div>
        </div>

        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
        
        <div className="text-center mt-4 mb-8">
          <div className="overflow-hidden flex justify-center mb-1">
            <h1 className={`text-3xl tracking-wide text-rose-50 flex ${playfair.className}`}>
              {titleChars.map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.05, ease: "easeOut" }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>
          </div>
          
          <div className="h-[20px] overflow-hidden relative mt-1">
            <AnimatePresence mode="popLayout">
              <motion.p
                key={greetingIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-sm font-medium text-rose-200/60 tracking-wider"
              >
                {GREETINGS[greetingIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mt-4 opacity-40">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-rose-300" />
            <Sparkles size={12} className="text-rose-300" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-rose-300" />
          </div>
        </div>

        <motion.form 
          onSubmit={handleLogin} 
          className="w-full space-y-6"
          key={shakeKey}
          animate={shakeKey > 0 ? { x: [-5, 5, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="relative group">
            {/* Focus Bloom Ring */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/30 to-violet-500/0 rounded-xl transition-opacity duration-500 blur-sm ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
            
            <div className="relative">
              <input
                id="credential"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="peer w-full bg-[#0a0812]/80 border border-white/[0.08] rounded-xl px-5 pt-6 pb-2 text-[15px] font-medium text-white transition-all duration-300 focus:outline-none focus:border-rose-400/40 focus:bg-[#0f0b18] shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder=" "
              />
              {/* Floating Label */}
              <label 
                htmlFor="credential"
                className="absolute left-5 top-4 text-slate-400 text-[15px] transition-all duration-300 peer-focus:-translate-y-2.5 peer-focus:text-xs peer-focus:text-rose-300/80 peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-rose-300/80 pointer-events-none"
              >
                Whisper it...
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4 border border-rose-300/30 rounded focus-within:border-rose-400 transition-colors bg-[#0a0812]">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <motion.div
                  initial={false}
                  animate={{ opacity: rememberMe ? 1 : 0, scale: rememberMe ? 1 : 0.5 }}
                  className="w-2 h-2 bg-rose-400 rounded-[2px]"
                />
              </div>
              <span className="text-xs text-rose-200/50 group-hover:text-rose-200/80 transition-colors">Remember me</span>
            </label>
            <span className="text-xs text-rose-200/30">Just the two of us</span>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                className="text-rose-400/90 text-xs font-medium text-center !mt-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: [
                  "0 0 15px rgba(244,63,94,0.2)",
                  "0 0 25px rgba(244,63,94,0.4)",
                  "0 0 15px rgba(244,63,94,0.2)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              type="submit"
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-rose-600/80 via-rose-500/80 to-purple-600/80 text-white font-medium text-[15px] py-4 transition-all border border-rose-400/20 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
              Enter Sanctuary
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
      
      {/* Footer Tagline */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 text-rose-200/30 text-xs tracking-widest uppercase flex items-center gap-2"
      >
        <Star size={10} />
        Always Private
        <Star size={10} />
      </motion.p>
    </main>
  );
}
