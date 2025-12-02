"use server";

import { z } from "zod";
import { addBook } from "@/lib/firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signUpWithEmailPassword, signInWithEmailPassword } from "@/lib/firebase/auth";
import { AuthError } from "firebase/auth";

const BookSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(1, "Content cannot be empty."),
  userId: z.string(),
});

const SignUpSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

const SignInSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});


function getAuthErrorMessage(error: AuthError): string {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "This email is already in use. Please try another email or log in.";
        case "auth/invalid-email":
            return "The email address is not valid. Please check and try again.";
        case "auth/operation-not-allowed":
            return "Email/password accounts are not enabled. Please contact support.";
        case "auth/weak-password":
            return "The password is too weak. Please choose a stronger password.";
        case "auth/user-disabled":
            return "This user account has been disabled.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
             return "Invalid email or password. Please check your credentials and try again.";
        default:
            return "An unexpected error occurred during authentication. Please try again.";
    }
}

export async function signUpAction(prevState: any, formData: FormData) {
    const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed.",
        };
    }
    
    const { email, password } = validatedFields.data;

    const { error } = await signUpWithEmailPassword(email, password);

    if (error) {
       return { message: getAuthErrorMessage(error as AuthError) };
    }
    // Client will handle redirect
    return { message: null, errors: {} };
}


export async function signInAction(prevState: any, formData: FormData) {
    const validatedFields = SignInSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed.",
        };
    }
    
    const { email, password } = validatedFields.data;

    const { error } = await signInWithEmailPassword(email, password);

    if (error) {
       return { message: getAuthErrorMessage(error as AuthError) };
    }
    // Client will handle redirect
    return { message: null, errors: {} };
}


export async function createBookAction(prevState: any, formData: FormData) {
  const validatedFields = BookSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const { title, content, userId } = validatedFields.data;
  let bookId = null;

  try {
    bookId = await addBook(title, content, userId);

    if (!bookId) {
      return { message: "Failed to create book in database." };
    }
  } catch (e) {
    return { message: "An unexpected error occurred." };
  }

  // Redirect must be called outside of the try/catch block
  revalidatePath("/dashboard");
  redirect(`/reader/${bookId}`);
}
