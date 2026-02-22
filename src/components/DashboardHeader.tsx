import React from 'react';
import { Search, X, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrashIcon123, StashLogo, EditIcon, PlusIcon } from '@/icons/logo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "motion/react";
import { Input } from './ui/input';
import { KeyboardShortcuts } from './KeyboardShortcuts';

interface DashboardHeaderProps {
  bookmarksCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onImportClick?: () => void;
  showSearch?: boolean;
  showImport?: boolean;
  editMode?: 'edit' | 'delete' | null;
  onEditModeChange?: (mode: 'edit' | 'delete' | null) => void;
  isSearchOpen: boolean;
  onSearchOpenChange: (isOpen: boolean) => void;
}

export function DashboardHeader({
  bookmarksCount,
  searchQuery,
  onSearchChange,
  onAddClick,
  onImportClick,
  showSearch = true,
  showImport = false,
  editMode,
  onEditModeChange,
  isSearchOpen,
  onSearchOpenChange,
}: DashboardHeaderProps) {
  return (
    <header className="relative">
      <div className="mx-auto px-4 sm:border-0 border-b border-gray-200/80 border-dashed h-14 sm:h-auto sm:py-2.5">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <StashLogo className="size-10 sm:size-12" />
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 h-9">
            {bookmarksCount > 0 && showSearch && (
              <div className="flex items-center h-full">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="flex items-center overflow-hidden mr-1"
                    >
                      <div className="relative flex items-center">
                        <Input
                          type="text"
                          placeholder="Search…"
                          value={searchQuery}
                          onChange={(e) => onSearchChange(e.target.value)}
                          autoFocus
                          className="h-7 w-36 sm:w-48 rounded-lg shadow-2xl bg-white text-sm placeholder:text-gray-400 text-gray-900 focus:ring-0 focus:shadow-lg pr-6"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => onSearchOpenChange(!isSearchOpen)}
                  className={cn(
                    "cursor-pointer flex items-center justify-center p-1.5 rounded-lg transition-colors",
                    isSearchOpen
                      ? "text-gray-700 bg-gray-100"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-300/40"
                  )}
                  title="Search (/)"
                >
                  <Search className="size-3 sm:size-3.5" />
                </button>
              </div>
            )}

            {/* Import when empty */}
            {showImport && bookmarksCount === 0 && onImportClick && (
              <Button
                onClick={onImportClick}
                size="sm"
                variant="ghost"
                className="px-0 pb-1 text-sm font-medium text-gray-900 hover:bg-transparent hover:opacity-70 transition-all duration-300 underline underline-offset-4 cursor-pointer"
              >
                Import
              </Button>
            )}

            {/* Edit / Delete mode toggles */}
            {bookmarksCount > 0 && (
              <>
                <button
                  onClick={() => onEditModeChange?.(editMode === 'edit' ? null : 'edit')}
                  disabled={editMode === 'delete'}
                  title="Edit Mode (E)"
                  className={cn(
                    "p-1.5 flex items-center justify-center cursor-pointer transition-all rounded-lg",
                    editMode === 'edit'
                      ? "bg-[#2c21ff] text-white sm:bg-[#2c21ff]"
                      : editMode === 'delete'
                        ? "opacity-30 cursor-not-allowed"
                        : "text-gray-500  hover:bg-blue-50"
                  )}
                >
                  <EditIcon
                    className="size-3 sm:size-3.5"
                    stroke={editMode === 'edit' ? 'white' : 'currentColor'}
                  />
                </button>
                <button
                  onClick={() => onEditModeChange?.(editMode === 'delete' ? null : 'delete')}
                  disabled={editMode === 'edit'}
                  title="Delete Mode (D)"
                  className={cn(
                    "p-1.5 flex items-center justify-center cursor-pointer transition-all rounded-lg",
                    editMode === 'delete'
                      ? "bg-red-500 text-white sm:bg-red-500"
                      : editMode === 'edit'
                        ? "opacity-30 cursor-not-allowed"
                        : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                  )}
                >
                  <TrashIcon123
                    className="size-3 sm:size-3.5"
                    fill={editMode === 'delete' ? 'white' : 'currentColor'}
                    secondaryfill={editMode === 'delete' ? 'rgba(255,255,255,0.7)' : 'currentColor'}
                  />
                </button>
              </>
            )}

            {/* Add */}
            <button
              onClick={onAddClick}
              title="Add New (A)"
              className="cursor-pointer flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <PlusIcon className="size-3 sm:size-3.5" />
            </button>

            <div className="hidden sm:block">
              <KeyboardShortcuts />
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}