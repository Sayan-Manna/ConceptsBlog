import { getPostBySlug } from "@/lib/posts";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import MDXContent from "@/components/MDXContent";
import LinkWithIcon from "@/components/LinkWithIcon";
import { ArrowLeftIcon } from "lucide-react";
import path from "path";
import NotFound from "@/app/not-found";
const blogDirectory = path.join(process.cwd(), "data");

// interface PageProps {
//   params: { slug: string };
// }
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params; // ✅ Await the params Promise
  const { slug } = resolvedParams;

  const post = await getPostBySlug(blogDirectory, slug);
  if (!post) {
    return <NotFound />;
  }

  const { metadata, content } = post;
  const { title, image, publishedAt } = metadata;

  return (
    <article className="mt-8 flex flex-col gap-8 p-16">
      <LinkWithIcon href="/" position="left" icon={<ArrowLeftIcon className="size-5" />} text="back to blog" />

      {image && (
        <div className="relative mb-6 h-96 w-full overflow-hidden rounded-lg">
          <Image src={image} alt={title || ""} className="object-cover" fill />
        </div>
      )}

      <header>
        <h1 className="title">{title}</h1>
        <p className="mt-2 text-xs text-muted-foreground">{formatDate(publishedAt ?? "")}</p>
      </header>

      <main className="prose dark:prose-invert">
        <MDXContent source={content} />
      </main>
    </article>
  );
}
