"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Logo } from "@/components/icons";
import { useFormState, useFormStatus } from "react-dom";
import { signInAction } from "@/app/(app)/actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from 'next/link';
import { Separator } from "@/components/ui/separator";

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.433,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign In"}
      </Button>
    );
  }

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(signInAction, initialState);

  const handleSignInWithGoogle = async () => {
    const user = await signInWithGoogle();
    if (user) {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);
  
  if(loading || user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/50">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
                <Logo className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold font-headline">LectorSync</h1>
            </div>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Sign in to access your personal library.</CardDescription>
        </CardHeader>
        <CardContent>
            <form action={dispatch} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                     {state.errors?.email && (
                        <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                     {state.errors?.password && (
                        <p className="text-sm text-destructive">{state.errors.password[0]}</p>
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

          <div className="my-4 flex items-center">
            <Separator className="flex-1" />
            <span className="px-4 text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <Button onClick={handleSignInWithGoogle} variant="outline" className="w-full">
            <GoogleIcon />
            Sign in with Google
          </Button>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
