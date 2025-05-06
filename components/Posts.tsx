"use client";
import { PostMetadata } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { useEffect, useState } from "react";
interface Props {
  posts: PostMetadata[];
  limit?: number;
}

export default function Posts({ posts, limit }: Props) {
  if (limit) {
    posts = posts.slice(0, limit);
  }
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    const updateCursor = (event: MouseEvent) => {
      requestAnimationFrame(() => {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
      });
    };

    document.addEventListener("mousemove", updateCursor);

    return () => {
      document.removeEventListener("mousemove", updateCursor);
      cursor.remove();
    };
  }, []);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  console.log(hoveredIndex);
  return (
    posts.length > 0 && (
      <Card className="bg-zinc-900 text-white border-none">
        <ul className="flex flex-col">
          {posts.map((post, i) => (
            <li
              key={i}
              onMouseEnter={() => {
                const cursor = document.querySelector(".custom-cursor") as HTMLElement;
                if (cursor) {
                  cursor.style.transform = "translate(-50%, -50%) scale(1)";
                }
                setHoveredIndex(i);
              }}
              onMouseLeave={() => {
                const cursor = document.querySelector(".custom-cursor") as HTMLElement;
                if (cursor) {
                  cursor.style.transform = "translate(-50%, -50%) scale(0)";
                }
                setHoveredIndex(null);
              }}
            >
              {i !== 0 && i !== posts.length && <Separator className="bg-muted-foreground" />}
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-col justify-between p-6 sm:flex-row sm:items-center">
                  <div className="max-w-md md:max-w-lg">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm font-light text-muted-foreground">{post.summary}</p>
                  </div>

                  {post.publishedAt && <p className="mt-2 flex w-full justify-end text-sm font-light sm:mt-0 sm:w-auto">{formatDate(post.publishedAt)}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    )
  );
}
