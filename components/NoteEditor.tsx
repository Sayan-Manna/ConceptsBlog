"use client";

import { useState, useTransition } from "react";
import { saveNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
);

interface NoteEditorProps {
  initialSlug?: string;
  initialTitle?: string;
  initialSummary?: string;
  initialContent?: string;
  initialPublishedAt?: string;
}

export default function NoteEditor({
  initialSlug = "",
  initialTitle = "",
  initialSummary = "",
  initialContent = "",
  initialPublishedAt,
}: NoteEditorProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    if (!slug || !title) return alert("Title and Slug are required.");
    
    startTransition(async () => {
      try {
        await saveNote(slug, title, summary, content, initialSlug, initialPublishedAt);
        router.push("/");
      } catch (e: any) {
        alert(e.message);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold">{initialSlug ? "Edit Note" : "New Note"}</h1>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Title</label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Note Title" 
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Slug</label>
        <Input 
          value={slug} 
          onChange={(e) => setSlug(e.target.value)} 
          placeholder="note-slug-no-spaces" 
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Summary (Optional)</label>
        <Input 
          value={summary} 
          onChange={(e) => setSummary(e.target.value)} 
          placeholder="Brief description of the note" 
        />
      </div>

      <div className="flex flex-col gap-2 flex-grow" data-color-mode="dark">
        <label className="text-sm font-medium">Content (Markdown)</label>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || "")}
          height={500}
          className="w-full mt-2"
        />
      </div>

      <div className="flex gap-4 justify-end">
        <Button variant="secondary" onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </div>
  );
}
