import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type Bookmark } from '@/types/index';
import { DashboardHeader } from '@/components/DashboardHeader';
import { AddEditForm } from '@/components/AddEditForm';
import { EmptyState } from '@/components/EmptyState';
import { BookmarksGrid } from '@/components/BookmarksGrid';
import { AppLayout, Main } from './AppLayout';
import { extractPageMetadata } from '@/utils/extractMetadata';

interface DashboardProps {
  bookmarks: Bookmark[];
  onAddBookmark: (bookmark: Bookmark) => void;
  onUpdateBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onSearchBookmarks: (query: string) => Bookmark[];
  onImport?: () => void;
}

export function Dashboard({
  bookmarks,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
  onSearchBookmarks,
  onImport,
}: DashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'edit' | 'delete' | null>(null);

  const searchQueryRef = useRef(searchQuery);
  const isSearchOpenRef = useRef(isSearchOpen);
  const editModeRef = useRef(editMode);
  const showAddFormRef = useRef(showAddForm);

  const displayedBookmarks = useMemo(
    () => (searchQuery.trim() ? onSearchBookmarks(searchQuery) : bookmarks),
    [searchQuery, onSearchBookmarks, bookmarks]
  );

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setTags('');
    setImage(null);
    setFavicon(null);
    setShowAddForm(false);
    setEditingBookmark(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowAddForm(true);
  };

  useEffect(() => {
    searchQueryRef.current = searchQuery;
    isSearchOpenRef.current = isSearchOpen;
    editModeRef.current = editMode;
    showAddFormRef.current = showAddForm;
  }, [searchQuery, isSearchOpen, editMode, showAddForm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentSearchQuery = searchQueryRef.current;
      const currentIsSearchOpen = isSearchOpenRef.current;
      const currentEditMode = editModeRef.current;
      const currentShowAddForm = showAddFormRef.current;

      // Ignore if input or textarea is focused (except for Escape)
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') {
          if (currentSearchQuery) {
            setSearchQuery('');
            e.preventDefault();
            return;
          }
          if (currentIsSearchOpen) {
            setIsSearchOpen(false);
            e.preventDefault();
            return;
          }
        }
        return;
      }

      // Search: / or Cmd+K
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      // Add: A or Cmd+B
      if (e.key === 'a' || e.key === 'A' || ((e.metaKey || e.ctrlKey) && e.key === 'b')) {
        e.preventDefault();
        resetForm();
        setShowAddForm(true);
      }

      // Edit Mode: E
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (currentEditMode === 'edit') setEditMode(null);
        else if (currentEditMode !== 'delete') setEditMode('edit');
      }

      // Delete Mode: D
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (currentEditMode === 'delete') setEditMode(null);
        else if (currentEditMode !== 'edit') setEditMode('delete');
      }

      // Escape to clear modes
      if (e.key === 'Escape') {
        if (currentEditMode) setEditMode(null);
        if (currentShowAddForm) setShowAddForm(false);
        if (currentIsSearchOpen && !currentSearchQuery) setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent, _metadata?: { title: string; image: string | null; favicon: string | null }, normalizedUrl?: string) => {
    e.preventDefault();
    const finalUrl = normalizedUrl || url.trim();
    if (!finalUrl) return;

    const needsMetadata = !editingBookmark && (!title.trim() || !image);
    const bookmarkId = editingBookmark?.id || `bookmark_${Date.now()}`;

    const bookmarkData: Bookmark = {
      id: bookmarkId,
      title: title.trim() || (() => { try { return new URL(finalUrl).hostname; } catch { return 'Bookmark'; } })(),
      url: finalUrl,
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      image: image || null,
      favicon: favicon || null,
      createdAt: editingBookmark?.createdAt || new Date().toISOString(),
    };

    if (editingBookmark) {
      onUpdateBookmark(bookmarkData);
    } else {
      onAddBookmark(bookmarkData);
    }

    resetForm();

    // Fetch metadata in the background and silently update the card
    if (needsMetadata) {
      extractPageMetadata(finalUrl).then((meta) => {
        onUpdateBookmark({
          ...bookmarkData,
          title: title.trim() || meta.title || bookmarkData.title,
          image: image || meta.image || null,
          favicon: favicon || meta.favicon || null,
        });
      }).catch(() => { /* silently ignore */ });
    }
  };

  const handleEdit = (bookmark: Bookmark) => {
    if (editMode === 'edit') {
      setEditingBookmark(bookmark);
      setUrl(bookmark.url);
      setTitle(bookmark.title);
      setTags(bookmark.tags?.join(', ') || '');
      setImage(bookmark.image || null);
      setFavicon(bookmark.favicon || null);
      setShowAddForm(true);
      setEditMode(null);
    }
  };

  const handleDelete = (id: string) => {
    if (editMode === 'delete') {
      onDeleteBookmark(id);
    }
  };

  return (
    <AppLayout>
      <div className="shrink-0">
        <DashboardHeader
          bookmarksCount={bookmarks.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddClick={handleAddNew}
          onImportClick={onImport}
          showSearch={true}
          showImport={true}
          editMode={editMode}
          onEditModeChange={setEditMode}
          isSearchOpen={isSearchOpen}
          onSearchOpenChange={setIsSearchOpen}
        />
      </div>

      {/* Add/Edit Form Modal */}
      <AddEditForm
        bookmark={editingBookmark}
        isOpen={showAddForm}
        url={url}
        title={title}
        tags={tags}
        image={image}
        favicon={favicon}
        onUrlChange={setUrl}
        onTitleChange={setTitle}
        onTagsChange={setTags}
        onImageChange={setImage}
        onFaviconChange={setFavicon}
        onSubmit={handleSubmit}
        onClose={resetForm}
      />

      <Main>
        {/* Empty State or Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <EmptyState onAddClick={handleAddNew} onImportClick={onImport} />
        ) : (
          <BookmarksGrid
            bookmarks={displayedBookmarks}
            searchQuery={searchQuery}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClearSearch={() => setSearchQuery('')}
            editMode={editMode}
          />
        )}
      </Main>
    </AppLayout>
  );
}
