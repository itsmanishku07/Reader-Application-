import { PlusCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { getBooks } from "@/lib/firebase/firestore";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

async function getDashboardData() {
  const user = auth.currentUser;
  if (!user) return [];
  const books = await getBooks(user.uid);
  return books.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
}

export default async function Dashboard() {
  const books = await getDashboardData();
  const emptyStateImage = PlaceHolderImages.find(p => p.id === 'dashboard-empty') || { imageUrl: 'https://picsum.photos/seed/2/600/400', imageHint: 'empty library' };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="My Library" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {books.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <Card key={book.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="font-headline truncate">{book.title}</CardTitle>
                  <CardDescription>
                    Last read: {formatDistanceToNow(book.lastAccessed, { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {book.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/reader/${book.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" /> Continue Reading
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
               <Image 
                src={emptyStateImage.imageUrl}
                alt="Empty library" 
                width={300} 
                height={200}
                className="rounded-lg object-cover"
                data-ai-hint={emptyStateImage.imageHint}
               />
              <h3 className="text-2xl font-bold tracking-tight font-headline">
                Your library is empty
              </h3>
              <p className="text-sm text-muted-foreground">
                Add some content to start reading.
              </p>
              <Button asChild>
                 <Link href="/upload">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Content
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
