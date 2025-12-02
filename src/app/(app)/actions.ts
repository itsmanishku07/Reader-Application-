"use server";

import { z } from "zod";
import { addBook } from "@/lib/firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BookSchema = z.object({
  title: z.string().min(1, "Title is required."),
  content: z.string().min(1, "Content cannot be empty."),
  userId: z.string(),
});

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

  try {
    const bookId = await addBook(title, content, userId);

    if (!bookId) {
      return { message: "Failed to create book in database." };
    }

    revalidatePath("/dashboard");
    redirect(`/reader/${bookId}`);
  } catch (e) {
    return { message: "An unexpected error occurred." };
  }
}
