import { useState, useEffect } from 'react';
import type { OnboardingStep, Bookmark } from '@/types';

export function useOnboardingState() {
  const [step, setStep] = useState<OnboardingStep>('dashboard');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const savedStep = localStorage.getItem('stash_step');
    const savedBookmarks = localStorage.getItem('stash_bookmarks');
    
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    }
    
    if (savedStep && ['welcome', 'import', 'dashboard'].includes(savedStep)) {
      setStep(savedStep as OnboardingStep);
    }
  }, []);

  const updateStep = (newStep: OnboardingStep) => {
    setStep(newStep);
    localStorage.setItem('stash_step', newStep);
  };

  const addBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(prev => {
      const updated = [...prev, ...newBookmarks];
      localStorage.setItem('stash_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const addBookmark = (bookmark: Bookmark) => {
    setBookmarks(prev => {
      const updated = [...prev, bookmark];
      localStorage.setItem('stash_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const updateBookmark = (updatedBookmark: Bookmark) => {
    setBookmarks(prev => {
      const updated = prev.map(bookmark =>
        bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
      );
      localStorage.setItem('stash_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.filter(bookmark => bookmark.id !== id);
      localStorage.setItem('stash_bookmarks', JSON.stringify(updated));
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

