import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, ChevronDown, Check } from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
}

export function FolderDropdown({ 
  activeFolderId, 
  onSelectFolder, 
  isOpen, 
  onToggle 
}: { 
  activeFolderId: string, 
  onSelectFolder: (id: string, name: string) => void,
  isOpen: boolean,
  onToggle: () => void
}) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeFolderName, setActiveFolderName] = useState('Main');

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const token = localStorage.getItem('chat_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://rudhasi.mooo.com";
        const res = await fetch(`${apiUrl}/api/folders`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          if (data.folders && data.folders.length > 0) {
            setFolders(data.folders);
            const active = data.folders.find((f: FolderItem) => f.id === activeFolderId);
            if (active) {
              setActiveFolderName(active.name);
            } else {
              // If activeFolderId is not in the list, fallback to the first available folder
              const firstFolder = data.folders[0];
              setActiveFolderName(firstFolder.name);
              onSelectFolder(firstFolder.id, firstFolder.name);
            }
          } else {
            // Auto-create Main folder if database is completely empty
            const createRes = await fetch(`${apiUrl}/api/folders`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ name: 'Main' }),
              credentials: "include"
            });
            if (createRes.ok) {
              const createData = await createRes.json();
              setFolders([createData.folder]);
              setActiveFolderName(createData.folder.name);
              onSelectFolder(createData.folder.id, createData.folder.name);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch folders", err);
      }
    };
    fetchFolders();
  }, [activeFolderId, isOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    setIsCreating(true);
    try {
      const token = localStorage.getItem('chat_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://rudhasi.mooo.com";
      const res = await fetch(`${apiUrl}/api/folders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newFolderName }),
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setFolders(prev => [...prev, data.folder]);
        setNewFolderName('');
        onSelectFolder(data.folder.id, data.folder.name);
        onToggle();
      }
    } catch (err) {
      console.error("Failed to create folder", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-raised)] transition-colors border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)]"
      >
        <span className="truncate max-w-[100px]">{activeFolderName}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-56 bg-[#0f0a1a] rounded-xl shadow-2xl border border-[var(--color-border)] overflow-hidden z-50 origin-top-right flex flex-col max-h-[300px]"
          >
            <div className="flex-1 overflow-y-auto p-1 scrollbar-hide">
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    onSelectFolder(f.id, f.name);
                    onToggle();
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                    activeFolderId === f.id 
                      ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' 
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] active:bg-[var(--color-surface-raised)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} className={activeFolderId === f.id ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} />
                    <span className="text-sm font-medium truncate">{f.name}</span>
                  </div>
                  {activeFolderId === f.id && <Check size={14} />}
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
              <form onSubmit={handleCreate} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="New folder..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] px-2"
                />
                <button 
                  type="submit"
                  disabled={isCreating || !newFolderName.trim()}
                  className="p-1.5 rounded bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 disabled:opacity-50 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
