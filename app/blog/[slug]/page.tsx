import { getPostBySlug } from "@/lib/posts";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import MDXContent from "@/components/MDXContent";
import LinkWithIcon from "@/components/LinkWithIcon";
import { ArrowLeftIcon } from "lucide-react";
import path from "path";
import NotFound from "@/app/not-found";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteNote } from "@/app/actions";

const blogDirectory = path.join(process.cwd(), "data");

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const post = await getPostBySlug(blogDirectory, slug);
  if (!post) {
    return <NotFound />;
  }

  const { metadata, content } = post;
  const { title, image, publishedAt, updatedAt } = metadata;

  const handleDelete = deleteNote.bind(null, slug);

  return (
    <article className="mt-8 flex flex-col gap-8 p-16">
      <div className="flex justify-between items-center">
        <LinkWithIcon href="/" position="left" icon={<ArrowLeftIcon className="size-5" />} text="back to blog" />
        <div className="flex gap-4">
          <Link href={`/blog/${slug}/edit`}>
            <Button variant="secondary" size="sm">Edit Note</Button>
          </Link>
          <form action={handleDelete}>
            <Button variant="destructive" size="sm" type="submit">Delete Note</Button>
          </form>
        </div>
      </div>

      {image && (
        <div className="relative mb-6 h-96 w-full overflow-hidden rounded-lg">
          <Image src={image} alt={title || ""} className="object-cover" fill />
        </div>
      )}

      <header>
        <h1 className="title">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {updatedAt ? `Last updated: ${formatDate(updatedAt)}` : formatDate(publishedAt ?? "")}
        </p>
      </header>

      <main className="prose dark:prose-invert">
        <MDXContent source={content} />
      </main>
    </article>
  );
}
