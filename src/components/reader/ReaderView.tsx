"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { ReaderControls } from "./ReaderControls";
import { updateBook } from "@/lib/firebase/firestore";
import { useDebouncedCallback } from "use-debounce";
import Link from 'next/link';
import { cn } from "@/lib/utils";

type ReaderViewProps = {
  initialBook: Book;
};

export function ReaderView({ initialBook }: ReaderViewProps) {
  const [book, setBook] = useState(initialBook);
  const [currentPage, setCurrentPage] = useState(initialBook.currentPage);
  const [totalPages, setTotalPages] = useState(1);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const calculatePages = useCallback(() => {
    if (contentRef.current && viewportRef.current) {
        const viewportWidth = viewportRef.current.clientWidth;
        if (viewportWidth > 0) {
            // Add a small buffer to prevent floating point inaccuracies
            const numPages = Math.ceil(contentRef.current.scrollWidth / viewportWidth + 0.01);
            setTotalPages(numPages);
            if (currentPage >= numPages) {
                setCurrentPage(Math.max(0, numPages - 1));
            }
        }
    }
  }, [currentPage]);
  
  useEffect(() => {
    const timer = setTimeout(calculatePages, 150); // Increased delay for fonts
    
    const handleResize = () => calculatePages();
    window.addEventListener("resize", handleResize);
    
    const observer = new MutationObserver(handleResize);
    if (contentRef.current) {
        observer.observe(contentRef.current, { childList: true, subtree: true, characterData: true });
    }

    return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
    }
  }, [calculatePages, book.settings.fontSize, book.settings.theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'sepia', 'indigo');
    if (book.settings.theme !== 'indigo') {
        root.classList.add(book.settings.theme);
    }
  }, [book.settings.theme]);

  const debouncedUpdateBook = useDebouncedCallback(async (page, settings) => {
    await updateBook(book.id, { currentPage: page, settings });
  }, 1000);

  useEffect(() => {
    debouncedUpdateBook(currentPage, book.settings);
  }, [currentPage, book.settings, debouncedUpdateBook]);
  
  const handleSettingsChange = (newSettings: Partial<Book["settings"]>) => {
    setBook(prevBook => ({
      ...prevBook,
      settings: { ...prevBook.settings, ...newSettings },
    }));
  };

  const goToPage = (page: number) => {
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(newPage);
  };
  
  const animationClass = book.settings.animation === 'fade' 
    ? 'transition-opacity duration-300' 
    : 'transition-transform duration-500 ease-in-out';
  const isFade = book.settings.animation === 'fade';

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between p-2 md:p-4 border-b shrink-0 z-20">
        <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard" aria-label="Back to dashboard">
                <BookOpen className="h-5 w-5" />
            </Link>
        </Button>
        <h1 className="text-lg font-semibold font-headline text-center truncate px-4">
          {book.title}
        </h1>
        <ReaderControls settings={book.settings} onSettingsChange={handleSettingsChange} />
      </header>
      
      <main className="flex-1 flex items-center justify-center overflow-hidden relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <div className="h-full w-full max-w-5xl overflow-hidden" ref={viewportRef}>
          <div
            className={cn("h-full w-full relative", !isFade && animationClass)}
            style={{
              transform: isFade ? 'none' : `translateX(-${currentPage * 100}%)`,
            }}
          >
            <div
              className="absolute inset-0 h-full w-auto"
              style={{
                columnWidth: viewportRef.current?.clientWidth,
                columnGap: '6rem', // This creates the space between pages
                fontSize: `${book.settings.fontSize}px`,
                lineHeight: 1.7,
              }}
              ref={contentRef}
            >
              <div className={cn(
                "p-8 md:p-12 text-justify h-full",
                 isFade && animationClass
               )}
               style={{
                 opacity: isFade ? 1 : undefined,
                 animationDelay: isFade ? `${currentPage * 300}ms` : undefined
               }}
              >
                {book.content}
              </div>
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next page"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </main>

      <footer className="p-2 md:p-4 border-t text-center text-sm text-muted-foreground shrink-0 z-20">
        Page {currentPage + 1} of {totalPages}
      </footer>
    </div>
  );
}
