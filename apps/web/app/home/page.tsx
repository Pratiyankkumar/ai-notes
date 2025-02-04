import { NoteCard } from "@/components/note-card";
import { notes } from "@/data/notes";

export default function Home() {
  return (
    <>
      <div className="flex flex-row items-center w-full gap-4 flex-wrap">
        {notes.map((note, i) => (
          <NoteCard key={i} {...note} />
        ))}
      </div>
    </>
  );
}
