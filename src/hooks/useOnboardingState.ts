import { useState, useEffect } from 'react';
import type { OnboardingStep, Bookmark } from '@/types';

const STORAGE_VERSION = 'v1';
const STEP_KEY = 'stash_step';
const BOOKMARKS_KEY = `stash_bookmarks_${STORAGE_VERSION}`;
const LEGACY_BOOKMARKS_KEY = 'stash_bookmarks';

export function useOnboardingState() {
  const [step, setStep] = useState<OnboardingStep>('dashboard');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const persistBookmarks = (value: Bookmark[]) => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(value));
  };

  useEffect(() => {
    const savedStep = localStorage.getItem(STEP_KEY);
    const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
    const legacyBookmarks = localStorage.getItem(LEGACY_BOOKMARKS_KEY);
    
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    } else if (legacyBookmarks) {
      try {
        const parsedLegacy = JSON.parse(legacyBookmarks) as Bookmark[];
        setBookmarks(parsedLegacy);
        persistBookmarks(parsedLegacy);
        localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
      } catch (e) {
        console.error('Failed to parse legacy bookmarks:', e);
      }
    }
    
    if (savedStep && ['welcome', 'import', 'dashboard'].includes(savedStep)) {
      setStep(savedStep as OnboardingStep);
    }
  }, []);

  const updateStep = (newStep: OnboardingStep) => {
    setStep(newStep);
    localStorage.setItem(STEP_KEY, newStep);
  };

  const addBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(prev => {
      const updated = [...prev, ...newBookmarks];
      persistBookmarks(updated);
      return updated;
    });
  };

  const addBookmark = (bookmark: Bookmark) => {
    setBookmarks(prev => {
      const updated = [...prev, bookmark];
      persistBookmarks(updated);
      return updated;
    });
  };

  const updateBookmark = (updatedBookmark: Bookmark) => {
    setBookmarks(prev => {
      const updated = prev.map(bookmark =>
        bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
      );
      persistBookmarks(updated);
      return updated;
    });
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(bookmark => bookmark.id !== id);
      persistBookmarks(updated);
      return updated;
    });
  };

  const searchBookmarks = (query: string) => {
    if (!query.trim()) return bookmarks;
    
    const lowercaseQuery = query.toLowerCase();
    return bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(lowercaseQuery) ||
      bookmark.url.toLowerCase().includes(lowercaseQuery) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  return {
    step,
    bookmarks,
    updateStep,
    addBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    searchBookmarks,
  };
}

