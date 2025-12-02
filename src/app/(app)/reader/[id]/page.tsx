"use client";

import { useEffect, useState } from "react";
import { getBook } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { ReaderView } from "@/components/reader/ReaderView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowLeft, LoaderCircle } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import type { Book } from "@/lib/types";

type ReaderPageProps = {
  params: {
    id: string;
  };
};

export default function ReaderPage({ params }: ReaderPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        // This case should be handled by the AppLayout, but as a fallback
        setLoading(false);
        setError("You must be logged in to view this page.");
        return;
    }

    async function fetchBook() {
      try {
        const fetchedBook = await getBook(params.id);
        if (!fetchedBook) {
          setError("The requested content could not be found.");
        } else if (fetchedBook.userId !== user.uid) {
          setError("You do not have permission to view this content.");
        } else {
          setBook(fetchedBook);
        }
      } catch (err) {
        setError("An error occurred while fetching the content.");
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [params.id, user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (!book) {
    // This case is handled by the error state but provides an extra fallback.
     return (
       <div className="flex h-screen w-full items-center justify-center">
         <p>Content not found.</p>
       </div>
     );
  }

  return <ReaderView initialBook={book} />;
}
