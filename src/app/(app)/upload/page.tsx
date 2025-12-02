"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createBookAction } from "../actions";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save and Start Reading"}
    </Button>
  );
}

export default function UploadPage() {
  const { user } = useAuth();
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createBookAction, initialState);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header title="Add New Content" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline">Import Your Content</CardTitle>
            <CardDescription>
              Give your reading material a title and paste the content below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={dispatch} className="space-y-6">
              <input type="hidden" name="userId" value={user?.uid} />
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., The Great Gatsby, Chapter 1"
                  required
                />
                {state.errors?.title && (
                  <p className="text-sm text-destructive">{state.errors.title[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Paste your text here..."
                  className="min-h-[300px]"
                  required
                />
                 {state.errors?.content && (
                  <p className="text-sm text-destructive">{state.errors.content[0]}</p>
                )}
              </div>

               {state.message && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
               )}

              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
