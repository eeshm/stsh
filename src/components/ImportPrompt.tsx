
import React, { useState, useRef } from 'react';
import {Loader2, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import { parseBookmarksFile } from '@/utils/parseBookmarksFile';
import { type Bookmark } from '@/types';
import { BookmarkIcon, StashLogo } from '@/icons/logo';
import { cn } from '@/lib/utils';
import { AppLayout, Main } from './AppLayout';

interface ImportPromptProps {
  onImportComplete: (bookmarks: Bookmark[]) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function ImportPrompt({ onImportComplete, onBack, onSkip }: ImportPromptProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);

    try {
      const bookmarks = await parseBookmarksFile(file);

      if (bookmarks.length === 0) {
        setError('No bookmarks found in the file. Please check the format.');
        setIsImporting(false);
        return;
      }

      setImportSuccess(true);

      setTimeout(() => {
        onImportComplete(bookmarks);
      }, 1000);
    } catch (err) {
      setError('Failed to parse bookmarks file. Please ensure it\'s a valid HTML export.');
      setIsImporting(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <AppLayout>
      <header className="relative">
        <div className="mx-auto px-4 sm:border-0 border-b border-gray-200/80 border-dashed h-14 sm:h-auto sm:py-2.5">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center">
              <StashLogo className="size-10 sm:size-12" />
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 p-1.5 rounded-lg text-gray-500 hover:text-gray-900  transition-colors text-sm sm:text-xs"
            >
              <ArrowLeft className="size-3 sm:size-3.5" />
              <span className="hidden sm:inline text-xs">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Gray Rounded Section */}
      <Main>
        <div className= "flex flex-col items-center justify-center w-full max-w-md mx-auto pt-12 sm:pt-20">
        <div className="text-center mb-8 space-y-2 px-2">
          <h2 className="text-2xl font-medium tracking-tight text-gray-900 sm:text-[#edecec]">
            Import Your Bookmarks
          </h2>
          <p className="text-[10px] text-gray-500 sm:text-[#edecec]/60">
            Bring your existing bookmarks from any browser
          </p>
        </div>

        {/* Upload Area */}
        <div className="flex flex-col items-center mb-8 w-full px-6 sm:px-0">
          <div
            onClick={!isImporting ? handleUploadClick : undefined}
            className={cn(
              "relative border border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 w-full sm:w-72 aspect-square flex items-center justify-center",
              "border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer",
              "sm:border-[#edecec]/10 sm:hover:border-[#edecec]/20 sm:hover:bg-[#edecec]/5"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isImporting}
            />

            {isImporting ? (
              <div className="space-y-4">
                <Loader2 className="size-6 mx-auto text-gray-400 sm:text-[#edecec]/40 animate-spin" />
                <p className="text-sm font-medium text-gray-500 sm:text-[#edecec]/60">
                  Importing...
                </p>
              </div>
            ) : importSuccess ? (
              <div className="space-y-4">
                <CheckCircle2 className="size-10 mx-auto text-green-600 sm:text-green-500" />
                <p className="text-sm font-medium text-green-600 sm:text-green-500">
                  Success! Redirecting...
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <span className='rounded-full bg-gray-100 sm:bg-[#edecec]/10 p-3'>
                  <BookmarkIcon className="size-5 sm:size-5 stroke-gray-600 sm:stroke-[#edecec]" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 sm:text-[#edecec]">
                    Click to upload
                  </p>
                  <p className="text-[10px] text-gray-500 sm:text-[#edecec]/40">
                    Supports HTML bookmark exports
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-600 sm:text-red-400 text-xs mt-3 font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="flex justify-center mb-8 w-full px-6 sm:px-0">
          <div className="w-full sm:w-auto flex flex-col border border-dashed rounded-lg border-gray-200 sm:border-[#edecec]/10 p-4 bg-gray-50/50 sm:bg-transparent">
            <h3 className="font-medium text-gray-900 sm:text-[#edecec] text-xs uppercase tracking-wider mb-2">
              How to export bookmarks
            </h3>
            <ul className="text-[10px] text-gray-500 sm:text-[#edecec]/60 space-y-1.5 leading-relaxed">
              <li><strong className="font-medium text-gray-700 sm:text-[#edecec]/80">Chrome/Edge:</strong> Menu → Bookmarks → Manager → Export</li>
              <li><strong className="font-medium text-gray-700 sm:text-[#edecec]/80">Firefox:</strong> Menu → Bookmarks → Manage → Import & Backup → Export</li>
              <li><strong className="font-medium text-gray-700 sm:text-[#edecec]/80">Safari:</strong> File → Export Bookmarks</li>
            </ul>
          </div>
        </div>

        {/* Skip Button */}
        <div className="text-center pb-8">
          <button
            onClick={onSkip}
            disabled={isImporting}
            className="text-[10px] text-gray-500 sm:text-[#edecec]/40 hover:text-gray-900 sm:hover:text-[#edecec] transition-colors underline underline-offset-4"
          >
            Skip for now
          </button>
        </div>
      </div>
      </Main>
    </AppLayout>
  );
}

