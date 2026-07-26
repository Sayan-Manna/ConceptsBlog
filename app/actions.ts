"use server";

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const dataDir = path.join(process.cwd(), "data");

export async function saveNote(
  slug: string,
  title: string,
  summary: string,
  content: string,
  originalSlug?: string,
  publishedAt?: string
) {
  if (!slug) {
    throw new Error("Slug is required");
  }

  // Ensure data directory exists
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}

  const now = new Date().toISOString().split("T")[0];
  const metadata = {
    title,
    summary,
    publishedAt: publishedAt || now,
    updatedAt: now,
  };

  const fileContent = matter.stringify(content, metadata);

  // If the slug changed, delete the old file
  if (originalSlug && originalSlug !== slug) {
    const oldFilePath = path.join(dataDir, `${originalSlug}.md`);
    try {
      await fs.unlink(oldFilePath);
    } catch {}
  }

  const newFilePath = path.join(dataDir, `${slug}.md`);
  await fs.writeFile(newFilePath, fileContent, "utf-8");

  revalidatePath("/");
  revalidatePath(`/blog/${slug}`);
  if (originalSlug) {
    revalidatePath(`/blog/${originalSlug}`);
  }
}

export async function deleteNote(slug: string) {
  if (!slug) return;
  
  const filePath = path.join(dataDir, `${slug}.md`);
  try {
    await fs.unlink(filePath);
  } catch {}

  revalidatePath("/");
  redirect("/");
}
