"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen, LoaderCircle } from "lucide-react";
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
  const [pages, setPages] = useState<string[]>([""]);
  const [currentPage, setCurrentPage] = useState(initialBook.currentPage);
  const [isPaginating, setIsPaginating] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const viewportRef = useRef<HTMLDivElement>(null);

  const getFontFamilyClass = (fontFamily: Book['settings']['fontFamily']) => {
    switch (fontFamily) {
      case 'sans':
        return 'font-sans';
      case 'mono':
        return 'font-mono';
      case 'serif':
      default:
        return 'font-serif';
    }
  };

  const paginateContent = useCallback(() => {
    if (!viewportRef.current || !book.content) {
      return;
    }
    setIsPaginating(true);
    
    const viewport = viewportRef.current;
    const { width, height } = viewport.getBoundingClientRect();
    
    const estimator = document.createElement('div');
    estimator.style.fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-' + book.settings.fontFamily);
    estimator.style.fontSize = `${book.settings.fontSize}px`;
    estimator.style.lineHeight = "1.7";
    estimator.style.textAlign = 'justify';
    estimator.style.width = `${width - (parseInt(getComputedStyle(viewport).paddingLeft) + parseInt(getComputedStyle(viewport).paddingRight))}px`;
    estimator.style.visibility = 'hidden';
    estimator.style.position = 'absolute';
    document.body.appendChild(estimator);
    
    const words = book.content.split(/\s+/);
    const newPages: string[] = [];
    let currentPageContent = "";

    for (const word of words) {
        const testContent = currentPageContent + (currentPageContent ? " " : "") + word;
        estimator.textContent = testContent;
        
        if (estimator.offsetHeight > height) {
            newPages.push(currentPageContent);
            currentPageContent = word;
        } else {
            currentPageContent = testContent;
        }
    }
    
    if (currentPageContent) {
        newPages.push(currentPageContent);
    }
    
    document.body.removeChild(estimator);
    
    setPages(newPages);
    if (currentPage >= newPages.length) {
        setCurrentPage(Math.max(0, newPages.length - 1));
    }
    setIsPaginating(false);

  }, [book.content, book.settings.fontSize, book.settings.fontFamily, currentPage]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'sepia', 'indigo');
    if (book.settings.theme !== 'indigo') {
        root.classList.add(book.settings.theme);
    }
  }, [book.settings.theme]);

  useEffect(() => {
    const timer = setTimeout(paginateContent, 100);
    
    const handleResize = () => paginateContent();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [paginateContent]);

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
    const totalPages = pages.length;
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    if (newPage !== currentPage) {
      setIsTransitioning(true);
      const duration = book.settings.animation === 'fade' ? 300 : 350;
      setTimeout(() => {
        setCurrentPage(newPage);
        setIsTransitioning(false);
      }, duration / 2);
    }
  };

  const totalPages = pages.length;
  
  const animationClass = isTransitioning 
    ? (book.settings.animation === 'fade' ? 'opacity-0' : 'opacity-50 scale-95')
    : 'opacity-100 scale-100';

  const fontClass = getFontFamilyClass(book.settings.fontFamily);

  return (
    <div className={cn("h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden", fontClass)}>
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
          disabled={currentPage === 0 || isTransitioning}
          aria-label="Previous page"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <div 
            className="h-full w-full max-w-5xl flex items-center justify-center p-8 md:p-12"
            style={{
                fontSize: `${book.settings.fontSize}px`,
                lineHeight: 1.7,
            }}
            ref={viewportRef}
        >
            {isPaginating ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <LoaderCircle className="h-6 w-6 animate-spin" />
                    <span>Formatting pages...</span>
                </div>
            ) : (
                 <div className={cn("text-justify transition-all duration-300 ease-in-out", animationClass)}>
                    {pages[currentPage]}
                 </div>
            )}
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isTransitioning}
          aria-label="Next page"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </main>

      <footer className="p-2 md:p-4 border-t text-center text-sm text-muted-foreground shrink-0 z-20">
        Page {isPaginating ? '...' : `${currentPage + 1} of ${totalPages}`}
      </footer>
    </div>
  );
}
