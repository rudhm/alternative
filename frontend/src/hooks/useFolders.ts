import { useState, useEffect, useCallback } from 'react';

export type ItemType = 'note' | 'todo';

export interface TodoTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface FolderItem {
  id: string;
  type: ItemType;
  title: string;
  content: string; // For notes: raw string. For todos: stringified TodoTask[]
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
  items: FolderItem[];
}

const STORAGE_KEY = 'chat_custom_folders';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse folders", e);
        }
      }
    }
    return [];
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever folders change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
    }
  }, [folders, isLoaded]);

  const addFolder = useCallback((name: string, icon: string = 'Folder') => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      icon,
      createdAt: Date.now(),
      items: [],
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder.id;
  }, []);

  const updateFolder = useCallback((id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
  }, []);

  const addItemToFolder = useCallback((folderId: string, item: Omit<FolderItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: FolderItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return { ...f, items: [newItem, ...f.items] };
      }
      return f;
    }));
    return newItem.id;
  }, []);

  const updateItemInFolder = useCallback((folderId: string, itemId: string, updates: Partial<FolderItem>) => {
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          items: f.items.map(item => item.id === itemId ? { ...item, ...updates, updatedAt: Date.now() } : item)
        };
      }
      return f;
    }));
  }, []);

  const deleteItemFromFolder = useCallback((folderId: string, itemId: string) => {
    setFolders(prev => prev.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          items: f.items.filter(item => item.id !== itemId)
        };
      }
      return f;
    }));
  }, []);

  return {
    folders,
    isLoaded,
    addFolder,
    updateFolder,
    deleteFolder,
    addItemToFolder,
    updateItemInFolder,
    deleteItemFromFolder,
  };
}
