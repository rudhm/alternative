import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchOverlay({ isOpen, onClose, onResultClick }: { isOpen: boolean, onClose: () => void, onResultClick: (msg: any) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://rudhasi.mooo.com";
        const res = await fetch(`${apiUrl}/api/messages/search?q=${encodeURIComponent(query)}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setResults(data.messages || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 left-0 w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-md z-[45] flex flex-col max-h-[60vh] overflow-hidden"
        >
          <div className="p-3 border-b border-[var(--color-border)] flex items-center gap-2">
            <Search size={18} className="text-[var(--color-text-muted)]" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 bg-transparent border-none outline-none text-[var(--color-text)] text-sm"
            />
            {isLoading && <Loader2 size={16} className="text-[var(--color-accent)] animate-spin" />}
            <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[var(--color-surface)] shadow-inner shadow-black/5">
            {query.trim() && !isLoading && results.length === 0 && (
              <div className="text-center p-4 text-[var(--color-text-muted)] text-sm">No results found</div>
            )}
            {results.map(msg => (
              <div 
                key={msg.id} 
                className="p-3 rounded-lg hover:bg-[var(--color-surface-raised)] cursor-pointer transition-colors border border-transparent hover:border-[var(--color-border)]"
                onClick={() => {
                  onResultClick(msg);
                  onClose();
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-[var(--color-accent)]">{msg.authorId}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm text-[var(--color-text)] line-clamp-2 leading-snug">
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
