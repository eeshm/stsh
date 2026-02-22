import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Bookmark } from '@/types/index';
import { motion, AnimatePresence } from 'motion/react';
import { BookmarkIcon } from '@/icons/logo';

interface AddEditFormProps {
  bookmark?: Bookmark | null;
  isOpen: boolean;
  url: string;
  title: string;
  tags: string;
  image: string | null;
  favicon: string | null;
  onUrlChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onImageChange: (value: string | null) => void;
  onFaviconChange: (value: string | null) => void;
  onSubmit: (e: React.FormEvent, metadata?: { title: string; image: string | null; favicon: string | null }, normalizedUrl?: string) => void;
  onClose: () => void;
}

export function AddEditForm({
  bookmark,
  isOpen,
  url,
  title,
  tags,
  image,
  onUrlChange,
  onTitleChange,
  onTagsChange,
  onSubmit,
  onClose,
}: AddEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const urlInputRef = React.useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && urlInputRef.current) {
      setTimeout(() => urlInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const normalizeUrl = (inputUrl: string) => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return trimmed;
    // Check if it has a protocol
    if (!/^https?:\/\//i.test(trimmed)) {
      // If it has a dot and text after it, assume it's a domain and prepend https://
      if (trimmed.includes('.') && !trimmed.endsWith('.')) {
        return `https://${trimmed}`;
      }
    }
    return trimmed;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className="fixed top-20 sm:top-32 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 flex justify-center px-4 sm:px-0"
          >
            <div className="bg-white sm:bg-[#0a0a0a] rounded-xl border border-gray-200 sm:border-[#edecec]/10 shadow-2xl w-full sm:w-[450px] overflow-hidden">
              <div className="flex items-center border-b border-gray-200 sm:border-[#edecec]/10 justify-between p-4 relative bg-gray-50/50 sm:bg-transparent">
                <div className='flex items-center gap-3'>
                  <div className='bg-white sm:bg-[#edecec]/10 border border-gray-200 sm:border-transparent rounded-lg p-2'>
                    <BookmarkIcon className="size-4 text-black sm:text-[#edecec]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 sm:text-[#edecec]">
                      {bookmark ? 'Edit Bookmark' : 'Add New Link'}
                    </h3>
                    <p className='text-[10px] text-gray-500 sm:text-[#edecec]/60 font-mono mt-0.5'>
                      Add to your personal stash
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100 sm:hover:bg-[#edecec]/10 transition-colors text-gray-400 sm:text-[#edecec]/40 hover:text-gray-900 sm:hover:text-[#edecec]"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!url.trim()) {
                  setError('Please enter a URL');
                  return;
                }
                
                const finalUrl = normalizeUrl(url);
                
                // Ensure URL is valid (must have protocol or have been normalized to have one)
                if (!/^https?:\/\//i.test(finalUrl) || finalUrl.endsWith('.')) {
                  setError('Please enter a valid URL');
                  return;
                }
                if (finalUrl !== url) {
                  onUrlChange(finalUrl);
                }

                // Submit immediately — metadata will be fetched in the background
                onSubmit(e, undefined, finalUrl);
              }}>
                <div className='p-4 space-y-4'>
                  <div className='space-y-1.5 relative'>
                    {error && (
                      <motion.span 
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-0 text-[10px] text-red-500 font-mono"
                      >
                        {error}
                      </motion.span>
                    )}
                    <ItemWithRef 
                      ref={urlInputRef} 
                      type="text" 
                      url={url} 
                      onChange={(val) => {
                        if (error) setError(null);
                        onUrlChange(val);
                      }} 
                      placeholder="https://..." 
                      label="URL" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className='space-y-1.5'>
                      <Item type="text" url={title} onChange={onTitleChange} placeholder="Title" label="Title" />
                    </div>
                    <div className='space-y-1.5'>
                      <Item type="text" url={tags} onChange={onTagsChange} placeholder="tag1, tag2" label="Tags" />
                    </div>
                  </div>
                </div>
                
                <div className='px-4 pb-4 flex justify-end gap-2'>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="h-8 text-[10px] text-gray-500 hover:text-gray-900 sm:text-[#edecec]/40 sm:hover:text-[#edecec] hover:bg-gray-100 sm:hover:bg-[#edecec]/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-8 text-[10px] bg-black text-white hover:bg-gray-800 sm:bg-[#edecec] sm:text-black sm:hover:bg-[#edecec]/90 border border-transparent sm:border-[#edecec]/10 min-w-20"
                  >
                    {bookmark ? 'Save Changes' : 'Add Bookmark'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


export const ItemWithRef = React.forwardRef<HTMLInputElement, { url: string; onChange: (value: string) => void, placeholder: string, label: string, type: string }>(
  function Item({ url, onChange, placeholder, label, type }, ref) {
    return (
      <div>
        <label className="block text-[10px] font-mono text-gray-500 sm:text-[#edecec]/40 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
        <Input
          ref={ref}
          type={type}
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={type === 'url'}
          className="h-9 bg-transparent text-base border-gray-200 sm:border-[#edecec]/10 text-gray-900 sm:text-[#edecec] placeholder:text-gray-400 sm:placeholder:text-[#edecec]/20 focus-visible:ring-0 focus-visible:border-gray-400 sm:focus-visible:border-[#edecec]/30 transition-colors"
        />
      </div>
    );
  }
);

export function Item({ url, onChange, placeholder, label, type }: { url: string; onChange: (value: string) => void, placeholder: string, label: string, type: string }) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-gray-500 sm:text-[#edecec]/40 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <Input
        type={type}
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={type === 'url'}
        className="h-9 bg-transparent text-base border-gray-200 sm:border-[#edecec]/10 text-gray-900 sm:text-[#edecec] placeholder:text-gray-400 sm:placeholder:text-[#edecec]/20 focus-visible:ring-0 focus-visible:border-gray-400 sm:focus-visible:border-[#edecec]/30 transition-colors"
      />
    </div>
  );
}