import fs from "fs";
import matter from "gray-matter";
import path from "path";

export type PostMetadata = {
  title?: string;
  summary?: string;
  publishedAt?: string;
  image?: string;
  slug: string;
};
export type Post = {
  metadata: PostMetadata;
  content: string;
};

export async function getPostBySlug(rootDir: string, slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(rootDir, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContents);
    return { metadata: { ...data, slug }, content };
  } catch {
    return null;
  }
}

export async function getPosts(rootDir: string, limit?: number): Promise<PostMetadata[]> {
  const files = fs.readdirSync(rootDir);
  const posts = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => getPostMetadata(rootDir, file))
    .sort((a, b) => (new Date(b.publishedAt ?? "").getTime() || 0) - (new Date(a.publishedAt ?? "").getTime() || 0));
  if (limit) {
    return posts.slice(0, limit);
  }
  return posts;
}

function getPostMetadata(rootDir: string, filePath: string): PostMetadata {
  const slug = filePath.replace(/\.md$/, "");
  const { data } = matter(fs.readFileSync(path.join(rootDir, filePath), "utf8"));
  return { ...data, slug };
}
