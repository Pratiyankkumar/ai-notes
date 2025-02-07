"use client";

import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { NoteCard } from "@/components/note-card";
import { getNote } from "@/api/queries/getNotes";
import { useQuery } from "react-query";
import { useAuth } from "@/contexts/AuthContext";

export interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  date?: string;
  timestamps?: string;
  images?: string[];
  audio?: string;
  fav?: boolean;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, error, isLoading } = useQuery("notes", getNote);

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <p>Please authentcate first</p>;
  }

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px]">
        <p className="text-muted-foreground">Loading notes...</p>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px] text-red-500">
        <p>Error loading notes</p>
      </div>
    );
  }

  const notes = data?.data?.notes || [];

  // Early return for empty state
  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px]">
        <p className="text-muted-foreground">Please add some notes first</p>
      </div>
    );
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note: Note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort the filtered notes
  const sortedNotes = filteredNotes.sort((a: Note, b: Note) => {
    const dateA =
      a.date || a.timestamps
        ? new Date(a.date || a.timestamps || "").getTime()
        : 0;
    const dateB =
      b.date || b.timestamps
        ? new Date(b.date || b.timestamps || "").getTime()
        : 0;
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <>
      {/* Search and Sort Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2 px-2 rounded-md border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="border-0 focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes Grid */}
      <div className="flex flex-row items-center w-full gap-4 flex-wrap">
        {sortedNotes.map((note: Note) => (
          <NoteCard
            key={note._id}
            title={note.title}
            content={note.content}
            date={note.createdAt}
            initialImages={note.images || []}
            audioUrl={note.audio || ""}
            type={note.audio ? "audio" : "text"}
            favorite={note.fav || false}
            noteId={note._id}
          />
        ))}
      </div>
    </>
  );
}
