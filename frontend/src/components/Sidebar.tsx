"use strict";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, Folder as FolderIcon, MoreVertical, X, Check, Edit2, Trash2, FileText, CheckSquare, Settings2, Sparkles, SmilePlus } from 'lucide-react';
import { useFolders, Folder, FolderItem } from '@/hooks/useFolders';
import { cn } from '@/lib/utils';
import { FolderView } from './FolderView';

export function Sidebar({ isOpen, onToggle }: { isOpen: boolean, onToggle: () => void }) {
  const { folders, isLoaded, addFolder, deleteFolder, updateFolder } = useFolders();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  
  // Create folder state
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Edit folder state
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderIcon, setEditFolderIcon] = useState('Folder');

  useEffect(() => {
    // If we close the sidebar, reset active folder
    if (!isOpen) {
      setTimeout(() => setActiveFolderId(null), 300);
    }
  }, [isOpen]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  const handleUpdateFolder = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editFolderName.trim()) {
      updateFolder(id, { name: editFolderName.trim(), icon: editFolderIcon });
      setEditingFolderId(null);
    }
  };

  const activeFolder = folders.find(f => f.id === activeFolderId);

  return (
    <>
      {/* Toggle Button */}
      <div 
        className={cn(
          "absolute top-4 z-[60] transition-all duration-300",
          isOpen ? "left-[320px] sm:left-[360px]" : "left-4"
        )}
      >
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors focus:outline-none"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight size={22} />
          </motion.div>
        </button>
      </div>

      {/* Drawer Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-sm sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
          opacity: isOpen ? 1 : 0.5
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute top-0 left-0 h-full w-[320px] sm:w-[360px] bg-[var(--color-surface-overlay)] backdrop-blur-2xl border-r border-[var(--color-border)] z-[50] flex flex-col shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {activeFolder ? (
            <FolderView 
              key="folder-view" 
              folder={activeFolder} 
              onBack={() => setActiveFolderId(null)} 
            />
          ) : (
            <motion.div 
              key="folder-list"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="p-6 border-b border-[var(--color-border)] shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-[var(--color-text)] flex items-center gap-2">
                    <Sparkles size={18} className="text-[var(--color-accent)]" />
                    Sanctuary
                  </h2>
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="p-1.5 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">Your private space for thoughts and tasks</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {isCreating && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateFolder}
                    className="bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-accent-glow)] shadow-inner"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      className="w-full bg-transparent border-b border-[var(--color-accent-muted)] px-2 py-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1">Cancel</button>
                      <button type="submit" disabled={!newFolderName.trim()} className="text-xs bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-3 py-1 rounded-md hover:bg-[var(--color-accent-glow)] disabled:opacity-50 transition-colors">Create</button>
                    </div>
                  </motion.form>
                )}

                {isLoaded && folders.length === 0 && !isCreating && (
                  <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                    <FolderIcon size={32} className="text-[var(--color-text-muted)] mb-3" />
                    <p className="text-sm text-[var(--color-text-secondary)]">No folders yet.</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Create one to store notes & to-dos.</p>
                  </div>
                )}

                {folders.map(folder => (
                  <div key={folder.id} className="group relative">
                    {editingFolderId === folder.id ? (
                      <form onSubmit={(e) => handleUpdateFolder(e, folder.id)} className="bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border-strong)]">
                        <div className="flex gap-2 mb-3">
                          <button type="button" onClick={() => setEditFolderIcon(editFolderIcon === 'Folder' ? 'Star' : 'Folder')} className="p-2 bg-[var(--color-border)] rounded-lg shrink-0">
                            {editFolderIcon === 'Folder' ? <FolderIcon size={16} className="text-[var(--color-accent)]" /> : <Sparkles size={16} className="text-[var(--color-warning)]" />}
                          </button>
                          <input
                            autoFocus
                            type="text"
                            value={editFolderName}
                            onChange={e => setEditFolderName(e.target.value)}
                            className="w-full bg-transparent border-b border-[var(--color-border-strong)] px-2 py-1 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <button type="button" onClick={() => { deleteFolder(folder.id); setEditingFolderId(null); }} className="text-xs text-[var(--color-danger)] hover:text-red-500 p-1 flex items-center gap-1"><Trash2 size={12}/> Delete</button>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setEditingFolderId(null)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2 py-1">Cancel</button>
                            <button type="submit" className="text-xs bg-[var(--color-accent-muted)] text-[var(--color-accent)] px-3 py-1 rounded-md hover:bg-[var(--color-accent-glow)]">Save</button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setActiveFolderId(folder.id)}
                        className="flex items-center p-3 rounded-xl hover:bg-[var(--color-surface-raised)] transition-colors cursor-pointer border border-transparent hover:border-[var(--color-border)] group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center shrink-0 border border-[var(--color-border)] mr-3">
                          {folder.icon === 'Star' ? <Sparkles size={18} className="text-[var(--color-warning)]" /> : <FolderIcon size={18} className="text-[var(--color-accent)]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-[var(--color-text)] truncate">{folder.name}</h3>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">{folder.items.length} item{folder.items.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditFolderName(folder.name);
                              setEditFolderIcon(folder.icon);
                              setEditingFolderId(folder.id);
                            }}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Settings2 size={16} />
                          </button>
                          <ChevronRight size={16} className="text-[var(--color-border-strong)]" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
