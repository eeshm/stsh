import React from 'react';
import { BookmarkCard } from '@/components/BookmarkCard';
import { type Bookmark } from '@/types/index';

interface BookmarksGridProps {
  bookmarks: Bookmark[];
  searchQuery: string;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onClearSearch: () => void;
  editMode?: 'edit' | 'delete' | null;
  focusedIndex?: number;
}

export function BookmarksGrid({
  bookmarks,
  searchQuery,
  onEdit,
  onDelete,
  onClearSearch,
  editMode,
  focusedIndex = -1,
}: BookmarksGridProps) {
  return (
    <>
      {/* Bookmarks Grid */}
      {bookmarks.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1.5 p-1 sm:p-2"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '420px' }}
        >
          {bookmarks.map((bookmark, index) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
              editMode={editMode}
              focused={index === focusedIndex}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-20">
          <p className="text-gray-500 sm:text-[#edecec]/40 font-mono text-sm">
            Nothing found for "{searchQuery}"
          </p>
          <button
            onClick={onClearSearch}
            className="mt-4 text-xs text-gray-400 hover:text-gray-900 sm:text-[#edecec]/30 sm:hover:text-[#edecec] transition-colors underline underline-offset-4 cursor-pointer"
          >
            Clear search
          </button>
        </div>
      ) : null}
    </>
  );
}
