"use client";

import { NoteCard } from "@/components/note-card";
import { notes } from "@/data/notes";

const favotes = notes.filter((note) => note.favorite === true);

export default function Home() {
  return (
    <>
      <div className="flex flex-row items-center w-full gap-4 flex-wrap">
        {favotes.map((note, i) => (
          <NoteCard key={i} {...note} />
        ))}
      </div>
    </>
  );
}
