"use strict";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, FileText, CheckSquare, Trash2, Check, Sparkles, Folder as FolderIcon, Save, Edit2 } from 'lucide-react';
import { useFolders, Folder, FolderItem, TodoTask } from '@/hooks/useFolders';
import { cn } from '@/lib/utils';

export function FolderView({ folder, onBack }: { folder: Folder, onBack: () => void }) {
  const { addItemToFolder, updateItemInFolder, deleteItemFromFolder } = useFolders();
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'todos'>('all');
  
  const [isCreating, setIsCreating] = useState<'none' | 'note' | 'todo'>('none');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || isCreating === 'none') return;

    let initialContent = '';
    if (isCreating === 'todo') {
      initialContent = JSON.stringify([{ id: crypto.randomUUID(), text: newItemContent, completed: false }]);
    } else {
      initialContent = newItemContent;
    }

    addItemToFolder(folder.id, {
      title: newItemTitle.trim(),
      type: isCreating,
      content: initialContent
    });
    
    setIsCreating('none');
    setNewItemTitle('');
    setNewItemContent('');
  };

  const filteredItems = folder.items.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === (activeTab === 'notes' ? 'note' : 'todo');
  });

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      className="flex flex-col h-full bg-transparent"
    >
      <div className="p-4 border-b border-[var(--color-border)] shrink-0 flex items-center gap-3">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-[var(--color-surface-raised)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-[var(--color-text)] truncate flex items-center gap-2">
            {folder.icon === 'Star' ? <Sparkles size={16} className="text-[var(--color-warning)]" /> : <FolderIcon size={16} className="text-[var(--color-accent)]" />}
            {folder.name}
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-4 pb-2 shrink-0">
        {(['all', 'notes', 'todos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize",
              activeTab === tab 
                ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent-glow)]" 
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {isCreating !== 'none' && (
          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-accent-glow)] shadow-xl relative"
            onSubmit={handleCreate}
          >
            <div className="flex items-center gap-2 mb-3 text-[var(--color-accent)] text-sm font-medium">
              {isCreating === 'note' ? <FileText size={16} /> : <CheckSquare size={16} />}
              New {isCreating === 'note' ? 'Note' : 'To-Do List'}
            </div>
            
            <input
              autoFocus
              type="text"
              placeholder="Title..."
              value={newItemTitle}
              onChange={e => setNewItemTitle(e.target.value)}
              className="w-full bg-transparent border-none text-base font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none mb-3"
            />
            
            {isCreating === 'note' ? (
              <textarea
                placeholder="Write your thoughts..."
                value={newItemContent}
                onChange={e => setNewItemContent(e.target.value)}
                className="w-full bg-[var(--color-surface-raised)] rounded-xl p-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] min-h-[100px] resize-none"
              />
            ) : (
              <input
                type="text"
                placeholder="First task..."
                value={newItemContent}
                onChange={e => setNewItemContent(e.target.value)}
                className="w-full bg-[var(--color-surface-raised)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setIsCreating('none')} className="px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors rounded-lg">Cancel</button>
              <button type="submit" disabled={!newItemTitle.trim()} className="px-4 py-1.5 text-xs font-medium bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50 flex items-center gap-2">
                <Save size={14} /> Save
              </button>
            </div>
          </motion.form>
        )}

        {filteredItems.length === 0 && isCreating === 'none' && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <div className="flex gap-4 mb-4 opacity-50">
              <FileText size={32} className="text-[var(--color-accent)]" />
              <CheckSquare size={32} className="text-[var(--color-accent-light)]" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">Folder is empty</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-[200px]">Create a note or to-do list to keep your thoughts organized.</p>
          </div>
        )}

        <AnimatePresence>
          {filteredItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              folderId={folder.id} 
              onUpdate={updateItemInFolder} 
              onDelete={deleteItemFromFolder} 
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-[var(--color-border)] shrink-0 flex gap-2">
        <button 
          onClick={() => setIsCreating('note')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-overlay)] text-[var(--color-text)] text-sm font-medium transition-colors border border-[var(--color-border)]"
        >
          <FileText size={16} /> Note
        </button>
        <button 
          onClick={() => setIsCreating('todo')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-overlay)] text-[var(--color-text)] text-sm font-medium transition-colors border border-[var(--color-border)]"
        >
          <CheckSquare size={16} /> To-Do
        </button>
      </div>
    </motion.div>
  );
}

function ItemCard({ item, folderId, onUpdate, onDelete }: { 
  item: FolderItem, 
  folderId: string,
  onUpdate: (folderId: string, itemId: string, updates: Partial<FolderItem>) => void,
  onDelete: (folderId: string, itemId: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  
  const [newTaskText, setNewTaskText] = useState('');

  let tasks: TodoTask[] = [];
  if (item.type === 'todo') {
    try { tasks = JSON.parse(content); } catch (e) { tasks = []; }
  }

  const handleSave = () => {
    onUpdate(folderId, item.id, { title, content });
    setIsEditing(false);
  };

  const toggleTask = (taskId: string) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    const newContent = JSON.stringify(newTasks);
    setContent(newContent);
    onUpdate(folderId, item.id, { content: newContent });
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTasks = [...tasks, { id: crypto.randomUUID(), text: newTaskText.trim(), completed: false }];
    const newContent = JSON.stringify(newTasks);
    setContent(newContent);
    onUpdate(folderId, item.id, { content: newContent });
    setNewTaskText('');
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="p-1.5 bg-[var(--color-surface-overlay)] backdrop-blur-md rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <Edit2 size={14} />
          </button>
        )}
        <button onClick={() => onDelete(folderId, item.id)} className="p-1.5 bg-[var(--color-surface-overlay)] backdrop-blur-md rounded-lg text-[var(--color-danger)] opacity-50 hover:opacity-100 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[var(--color-accent)] opacity-80 mb-2">
        {item.type === 'note' ? <FileText size={14} /> : <CheckSquare size={14} />}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{item.type}</span>
      </div>

      {isEditing ? (
        <div className="space-y-3 relative z-20 mt-1">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--color-border-strong)] pb-1 text-base font-semibold text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
          {item.type === 'note' && (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-[var(--color-surface-raised)] rounded-xl p-3 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] min-h-[100px] resize-y"
            />
          )}
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium bg-[var(--color-accent-muted)] text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent-glow)] transition-colors">
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-1 relative z-20 pointer-events-none">
          <h3 className="text-base font-medium text-[var(--color-text)] mb-2">{title}</h3>
          
          {item.type === 'note' ? (
            <div className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed line-clamp-6">
              {content}
            </div>
          ) : (
            <div className="space-y-2 mt-3 pointer-events-auto">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 group/task">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "mt-0.5 shrink-0 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors",
                      task.completed 
                        ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white" 
                        : "border-[var(--color-border-strong)] hover:border-[var(--color-accent)] text-transparent"
                    )}
                  >
                    <Check size={12} strokeWidth={3} />
                  </button>
                  <span className={cn(
                    "text-sm transition-all",
                    task.completed ? "text-[var(--color-text-muted)] line-through" : "text-[var(--color-text)] opacity-80"
                  )}>
                    {task.text}
                  </span>
                </div>
              ))}
              
              <form onSubmit={addTask} className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--color-border)]">
                <Plus size={14} className="text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Add a task..."
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  className="w-full bg-transparent border-none text-sm text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                />
              </form>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
