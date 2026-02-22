import React, { useState } from 'react';
import { EditIcon, TrashIcon123 } from '@/icons/logo';
import { type Bookmark } from '@/types/index';
import { motion, AnimatePresence } from 'motion/react';

import { cn } from '@/lib/utils';
import { TextScramble } from '@/components/ui/text-scramble';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete?: (id: string) => void;
  onEdit?: (bookmark: Bookmark) => void;
  editMode?: 'edit' | 'delete' | null;
}

export function BookmarkCard({ bookmark, onDelete, onEdit, editMode }: BookmarkCardProps) {
  const [hoverSide, setHoverSide] = useState<'left' | 'right' | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);

  React.useEffect(() => {
    setIsInitialMount(false);
  }, []);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.width / 2;
    const mouseX = e.clientX - rect.left;
    const side = mouseX < midpoint ? 'left' : 'right';
    setHoverSide(side);
  };

  const handleMouseLeave = () => {
    setHoverSide(null);
  };

  return (
    <motion.div
      initial={{ y: 0, rotate: 0, x: 0 }}
      transition={{
        ease: "easeInOut",
        duration: 0.15,
      }}
      animate={!editMode && hoverSide && !isInitialMount ? {
        y: -3,
        rotate: hoverSide === 'left' ? -0.4 : 0.4,
      } : { y: 0, rotate: 0 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative w-full h-10",
        "flex items-center justify-between rounded-lg overflow-hidden transition-all duration-200",
        "bg-white border border-gray-200 hover:border-gray-300",
        "sm:bg-[#edecec]/8 sm:border-[#edecec]/10 sm:hover:border-[#edecec]/25",
      )}
    >
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-3 px-3 min-w-0 flex-1",
          editMode ? "pointer-events-none" : ""
        )}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {bookmark.favicon ? (
            <img
              src={bookmark.favicon}
              alt=""
              className="size-3.5 rounded-sm shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="size-3.5 rounded-sm shrink-0 bg-gray-100 sm:bg-[#edecec]/10" />
          )}
          <h3 className="font-medium text-xs sm:text-sm truncate leading-none pt-0.5 text-gray-900 sm:text-[#edecec] group-hover:text-black sm:group-hover:text-white transition-colors">
            <TextScramble speed={0.05}>
              {bookmark.title}
            </TextScramble>
          </h3>
        </div>
        <p className={cn(
          "text-[9px] sm:text-[10px] text-gray-400 sm:text-[#edecec]/35 truncate shrink-0 font-mono transition-opacity duration-200",
          editMode ? "opacity-0" : "opacity-100"
        )}>
          {getDomain(bookmark.url)}
        </p>
      </a>

      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
        <AnimatePresence>
          {editMode === 'edit' && onEdit && (
            <motion.button
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => onEdit(bookmark)}
              className="p-1.5 rounded-lg cursor-pointer text-blue-500 hover:bg-[#635cff] hover:text-white transition-colors"
            >
              <EditIcon className="size-3" stroke="currentColor" />
            </motion.button>
          )}
          {editMode === 'delete' && onDelete && (
            <motion.button
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => onDelete(bookmark.id)}
              className="p-1.5 rounded-lg cursor-pointer text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <TrashIcon123
                className="size-3"
                fill="currentColor"
                secondaryfill="currentColor"
              />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}