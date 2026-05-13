import React, { useState, useEffect } from 'react';
import { EditIcon, TrashIcon123 } from '@/icons/logo';
import { type Bookmark } from '@/types/index';

import { cn } from '@/lib/utils';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete?: (id: string) => void;
  onEdit?: (bookmark: Bookmark) => void;
  editMode?: 'edit' | 'delete' | null;
  focused?: boolean;
}

export function BookmarkCard({ bookmark, onDelete, onEdit, editMode, focused, index = 0 }: BookmarkCardProps & { index?: number }) {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const domain = getDomain(bookmark.url);

  const [faviconStatus, setFaviconStatus] = useState<'loading' | 'loaded' | 'error'>(
    bookmark.favicon ? 'loading' : 'error'
  );

  useEffect(() => {
    setFaviconStatus(bookmark.favicon ? 'loading' : 'error');
  }, [bookmark.favicon]);

  return (
    <div
      style={{ animationDelay: `${index * 30}ms` }}
      className={cn(
        "group relative w-full h-10 animate-stagger-in",
        "flex items-center justify-between rounded-lg overflow-hidden transition-all",
        "bg-white border hover:border-gray-300 active:scale-[0.97]",
        "sm:bg-[#edecec]/8 sm:hover:border-[#edecec]/5",
        focused ? "border-gray-400 sm:border-[#edecec]/50 ring-1 ring-gray-400 sm:ring-[#edecec]/50" : "border-gray-200 sm:border-[#edecec]/10"
      )}
    >
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        className={cn(
          "flex items-center gap-3 px-3 min-w-0 flex-1 outline-none",
          editMode ? "pointer-events-none" : ""
        )}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {bookmark.favicon && (
            <img
              src={bookmark.favicon}
              alt=""
              className={cn(
                "size-3.5 rounded-sm shrink-0 opacity-80 group-hover:opacity-100 transition-opacity",
                faviconStatus !== 'loaded' && "hidden"
              )}
              onLoad={() => setFaviconStatus('loaded')}
              onError={() => setFaviconStatus('error')}
            />
          )}

          {faviconStatus !== 'loaded' && (
            <div className="size-3.5 rounded-sm shrink-0 bg-gray-100 sm:bg-[#edecec]/10" />
          )}
          <h3 className="font-medium text-xs sm:text-sm truncate leading-none pt-0.5 text-gray-900 sm:text-[#edecec] group-hover:text-black sm:group-hover:text-white transition-colors">
            {bookmark.title}
          </h3>
        </div>
        <p className={cn(
          "text-[9px] sm:text-[10px] text-gray-400 sm:text-[#edecec]/35 truncate shrink-0 font-mono transition-opacity duration-200",
          editMode ? "opacity-0" : "opacity-100"
        )}>
          {domain}
        </p>
      </a>

      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
          {editMode === 'edit' && onEdit && (
            <button
              onClick={() => onEdit(bookmark)}
              className="p-1.5 rounded-lg cursor-pointer text-[#2c21ff] hover:bg-[#2c21ff] hover:text-white transition-colors duration-200 active:scale-[0.97]"
            > 
              <EditIcon className="size-3" stroke="currentColor" />
            </button>
          )}
          {editMode === 'delete' && onDelete && (
            <button
              onClick={() => onDelete(bookmark.id)}
              className="p-1.5 rounded-lg cursor-pointer text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200 active:scale-[0.97]"
            >
              <TrashIcon123
                className="size-3"
                fill="currentColor"
                secondaryfill="currentColor"
              />
            </button>
          )}
      </div>
    </div>
  );
}