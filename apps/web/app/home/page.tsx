"use client";
import { useState, useMemo } from "react";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { NoteCard } from "@/components/note-card";
import { notes } from "@/data/notes";

export default function Home() {
  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    // First filter the notes
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then sort them
    return [...filtered].sort((a, b) => {
      if (sortOrder === "asc") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [searchQuery, sortOrder]);

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
        {filteredNotes.map((note, i) => (
          <NoteCard key={i} {...note} />
        ))}
      </div>
    </>
  );
}
