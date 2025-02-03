import { NoteCard } from "@/components/note-card";

const notes = [
  {
    title: "Engineering Assignment Audio",
    content:
      "I'm recording an audio to transcribe into text for the assignment of engineering in terms of actors..",
    date: "Jan 30, 2025 · 5:26 PM",
    duration: "00:09",
    type: "audio" as const,
    hasImage: true,
  },
  {
    title: "Random Sequence",
    content: "ssxscscscsc",
    date: "Jan 30, 2025 · 5:21 PM",
    type: "text" as const,
  },
];

export default function Home() {
  return (
    <>
      <div className="grid gap-4">
        {notes.map((note, i) => (
          <NoteCard key={i} {...note} />
        ))}
      </div>
    </>
  );
}
