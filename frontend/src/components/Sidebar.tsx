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
          "absolute top-4 z-[250000] transition-all duration-300",
          isOpen ? "left-[320px] sm:left-[360px]" : "left-4"
        )}
      >
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md text-[var(--color-text)] hover:text-rose-400 transition-colors focus:outline-none"
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
            className="fixed inset-0 z-[240000] bg-black/40 backdrop-blur-sm sm:hidden"
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
        className="absolute top-0 left-0 h-full w-[320px] sm:w-[360px] bg-[#ffffff0a] dark:bg-[#0a0812e6] backdrop-blur-2xl border-r border-white/[0.08] dark:border-white/[0.05] z-[245000] flex flex-col shadow-2xl"
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
              <div className="p-6 border-b border-white/[0.08] shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-rose-50 flex items-center gap-2">
                    <Sparkles size={18} className="text-rose-400" />
                    Sanctuary
                  </h2>
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <p className="text-xs text-rose-200/50">Your private space for thoughts and tasks</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                {isCreating && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateFolder}
                    className="bg-black/20 rounded-xl p-3 border border-rose-500/20 shadow-inner"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      className="w-full bg-transparent border-b border-rose-500/30 px-2 py-1 text-sm text-rose-100 placeholder:text-rose-200/30 focus:outline-none focus:border-rose-400 transition-colors mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-rose-200/50 hover:text-rose-200 px-2 py-1">Cancel</button>
                      <button type="submit" disabled={!newFolderName.trim()} className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-md hover:bg-rose-500/40 disabled:opacity-50 transition-colors">Create</button>
                    </div>
                  </motion.form>
                )}

                {isLoaded && folders.length === 0 && !isCreating && (
                  <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                    <FolderIcon size={32} className="text-rose-200/50 mb-3" />
                    <p className="text-sm text-rose-200/70">No folders yet.</p>
                    <p className="text-xs text-rose-200/40 mt-1">Create one to store notes & to-dos.</p>
                  </div>
                )}

                {folders.map(folder => (
                  <div key={folder.id} className="group relative">
                    {editingFolderId === folder.id ? (
                      <form onSubmit={(e) => handleUpdateFolder(e, folder.id)} className="bg-black/20 rounded-xl p-3 border border-rose-500/30">
                        <div className="flex gap-2 mb-3">
                          <button type="button" onClick={() => setEditFolderIcon(editFolderIcon === 'Folder' ? 'Star' : 'Folder')} className="p-2 bg-white/5 rounded-lg shrink-0">
                            {editFolderIcon === 'Folder' ? <FolderIcon size={16} className="text-rose-300" /> : <Sparkles size={16} className="text-yellow-300" />}
                          </button>
                          <input
                            autoFocus
                            type="text"
                            value={editFolderName}
                            onChange={e => setEditFolderName(e.target.value)}
                            className="w-full bg-transparent border-b border-rose-500/30 px-2 py-1 text-sm text-rose-100 focus:outline-none focus:border-rose-400 transition-colors"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <button type="button" onClick={() => { deleteFolder(folder.id); setEditingFolderId(null); }} className="text-xs text-red-400 hover:text-red-300 p-1 flex items-center gap-1"><Trash2 size={12}/> Delete</button>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setEditingFolderId(null)} className="text-xs text-rose-200/50 hover:text-rose-200 px-2 py-1">Cancel</button>
                            <button type="submit" className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-md hover:bg-rose-500/40">Save</button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setActiveFolderId(folder.id)}
                        className="flex items-center p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-white/[0.05] group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/[0.05] mr-3">
                          {folder.icon === 'Star' ? <Sparkles size={18} className="text-yellow-400/80" /> : <FolderIcon size={18} className="text-rose-300/80" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-rose-50 truncate">{folder.name}</h3>
                          <p className="text-xs text-rose-200/40 truncate">{folder.items.length} item{folder.items.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditFolderName(folder.name);
                              setEditFolderIcon(folder.icon);
                              setEditingFolderId(folder.id);
                            }}
                            className="p-2 text-rose-200/30 hover:text-rose-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Settings2 size={16} />
                          </button>
                          <ChevronRight size={16} className="text-rose-200/20" />
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
