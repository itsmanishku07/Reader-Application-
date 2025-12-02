import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Palette, Cloud, Smartphone } from 'lucide-react';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const featureCards = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: 'Seamless Reading',
    description: 'Upload your text or PDF and dive into a distraction-free reading experience designed for comfort.',
  },
  {
    icon: <Palette className="w-8 h-8 text-primary" />,
    title: 'Customize Your View',
    description: 'Adjust fonts, sizes, and color themes to create a reading environment that’s easy on your eyes.',
  },
  {
    icon: <Cloud className="w-8 h-8 text-primary" />,
    title: 'Sync Across Devices',
    description: 'Your reading progress, bookmarks, and customizations are saved and synced automatically.',
  },
  {
    icon: <Smartphone className="w-8 h-8 text-primary" />,
    title: 'Read Anywhere',
    description: 'With offline access, your library is always with you, even without an internet connection.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero') || { imageUrl: 'https://picsum.photos/seed/1/1200/800', imageHint: 'reading book' };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">LectorSync</h1>
        </div>
        <nav>
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold font-headline text-primary-foreground tracking-tight">
              Your Personal Reading Sanctuary
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-secondary-foreground">
              Transform any text into a beautiful, readable book. LectorSync personalizes your reading experience, syncing your progress everywhere.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/login">Start Reading for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold font-headline">A Better Way to Read</h3>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                LectorSync is packed with features to make your reading time more enjoyable and productive.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureCards.map((feature) => (
                <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-none bg-card">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Showcase Section */}
        <section className="bg-secondary/50 py-20 md:py-28">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
             <div className="pr-8">
              <h3 className="text-3xl md:text-4xl font-bold font-headline">Immerse Yourself</h3>
              <p className="mt-4 text-lg text-muted-foreground">
                Our clean, book-like interface splits content into manageable pages with smooth transitions. Say goodbye to endless scrolling and hello to focused reading.
              </p>
              <Button asChild variant="link" className="mt-4 pl-0 text-lg">
                <Link href="/login">Try the reader now &rarr;</Link>
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
               <Image
                src={heroImage.imageUrl}
                alt="Screenshot of LectorSync reader interface"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                data-ai-hint={heroImage.imageHint}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LectorSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
