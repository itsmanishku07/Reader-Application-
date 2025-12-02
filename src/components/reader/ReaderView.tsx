"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { ReaderControls } from "./ReaderControls";
import { updateBook } from "@/lib/firebase/firestore";
import { useDebouncedCallback } from "use-debounce";
import Link from 'next/link';

type ReaderViewProps = {
  initialBook: Book;
};

export function ReaderView({ initialBook }: ReaderViewProps) {
  const [book, setBook] = useState(initialBook);
  const [currentPage, setCurrentPage] = useState(initialBook.currentPage);
  const [totalPages, setTotalPages] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);

  const calculatePages = useCallback(() => {
    if (pageContentRef.current && contentRef.current) {
      const contentWidth = pageContentRef.current.scrollWidth;
      const viewportWidth = contentRef.current.clientWidth;
      const pages = viewportWidth > 0 ? Math.ceil(contentWidth / viewportWidth) : 1;
      setTotalPages(pages);
      if (currentPage >= pages) {
        setCurrentPage(Math.max(0, pages - 1));
      }
    }
  }, [currentPage]);
  
  useEffect(() => {
    // A small delay to ensure fonts are loaded and dimensions are stable
    const timer = setTimeout(calculatePages, 100);
    
    const handleResize = () => calculatePages();
    window.addEventListener("resize", handleResize);
    
    const observer = new MutationObserver(handleResize);
    if (pageContentRef.current) {
        observer.observe(pageContentRef.current, { attributes: true, attributeFilter: ['style'], subtree: false });
    }

    return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
    }
  }, [calculatePages, book.settings.fontSize]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'sepia', 'indigo');
    if (book.settings.theme !== 'indigo') {
        root.classList.add(book.settings.theme);
    }
     // Force a re-calculation of pages when theme changes, as it might affect layout
    calculatePages();
  }, [book.settings.theme, calculatePages]);

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
  
  const animationClass = book.settings.animation === 'fade' ? 'transition-opacity duration-300' : 'transition-transform duration-300 ease-in-out';
  const isSlide = book.settings.animation === 'slide';

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <header className="flex items-center justify-between p-2 md:p-4 border-b shrink-0">
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

        <div className="h-full w-full max-w-4xl overflow-hidden" ref={contentRef}>
            <div 
                className={`h-full w-full flex ${isSlide ? animationClass : ''}`}
                style={{ 
                    transform: isSlide ? `translateX(-${currentPage * 100}%)` : 'none',
                 }}
            >
                 <div
                    className={`flex-shrink-0 w-full h-full p-8 md:p-12 relative ${!isSlide ? `absolute inset-0 ${animationClass}` : ''}`}
                    style={{
                        opacity: !isSlide && currentPage > 0 ? 0 : 1,
                    }}
                    aria-hidden={currentPage > 0}
                >
                     <div 
                        className="h-full text-justify columns-1 md:columns-2 gap-x-16"
                        style={{
                            fontSize: `${book.settings.fontSize}px`,
                            lineHeight: 1.7,
                            transform: `translateX(-${currentPage * 100}%)`,
                        }}
                        ref={pageContentRef} 
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

      <footer className="p-2 md:p-4 border-t text-center text-sm text-muted-foreground shrink-0">
        Page {currentPage + 1} of {totalPages}
      </footer>
    </div>
  );
}
