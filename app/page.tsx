import PostWithSearch from "@/components/PostWithSearch";
import { getPosts } from "@/lib/posts";
import path from "path";

const blogDirectory = path.join(process.cwd(), "data");

export default async function Home() {
  const posts = await getPosts(blogDirectory);

  return (
    <div className=" p-16">
      <section>
        {/* This will have all docs list */}
        <PostWithSearch posts={posts} />
      </section>
    </div>
  );
}
