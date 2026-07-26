import NoteEditor from "@/components/NoteEditor";
import { getPostBySlug } from "@/lib/posts";
import path from "path";
import NotFound from "@/app/not-found";

const blogDirectory = path.join(process.cwd(), "data");

export default async function EditNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const post = await getPostBySlug(blogDirectory, slug);
  if (!post) {
    return <NotFound />;
  }

  const { metadata, content } = post;
  const { title, summary, publishedAt } = metadata;

  return (
    <div className="py-16">
      <NoteEditor 
        initialSlug={slug}
        initialTitle={title}
        initialSummary={summary}
        initialContent={content}
        initialPublishedAt={publishedAt}
      />
    </div>
  );
}
