import { getBook } from "@/lib/firebase/firestore";
import { auth } from "@/lib/firebase/config";
import { redirect } from "next/navigation";
import { ReaderView } from "@/components/reader/ReaderView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

type ReaderPageProps = {
  params: {
    id: string;
  };
};

export default async function ReaderPage({ params }: ReaderPageProps) {
  const book = await getBook(params.id);
  const user = auth.currentUser;

  if (!book || !user) {
    return redirect("/dashboard");
  }

  // Security check: ensure the book belongs to the logged-in user
  if (book.userId !== user.uid) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-lg">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                You do not have permission to view this content.
                </AlertDescription>
            </Alert>
            <Button asChild variant="link" className="mt-4">
                <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard</Link>
            </Button>
        </div>
    );
  }

  return <ReaderView initialBook={book} />;
}

export const dynamic = 'force-dynamic';
