"use client";
import { PostMetadata } from "@/lib/posts";
import { useState } from "react";
import Posts from "./Posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  posts: PostMetadata[];
}

export default function PostsWithSearch({ posts }: Props) {
  const [query, setQuery] = useState("");
  const filtered = posts.filter((post) => post.title?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-12 ">
      <div className="flex items-center gap-3">
        <Input type="text" placeholder="Search something..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button size="sm" variant="secondary" onClick={() => setQuery("")} disabled={!query.length}>
          Clear
        </Button>
      </div>
      <Posts posts={filtered} />
    </div>
  );
}
