import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Pen, ImageIcon, X, Mic, MicOff } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Toast } from "@workspace/ui/components/toast";
import { useMutation, useQueryClient } from "react-query";
import { uploadNote } from "@/api/mutations/uploadNote";

// Speech Recognition types remain the same...
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error?: unknown;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface ImageFile {
  url: string;
  file: File;
}

export default function VoiceNoteInput() {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [titleError, setTitleError] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  // Previous useEffects remain the same...
  useEffect(() => {
    if (noteTextareaRef.current) {
      noteTextareaRef.current.scrollTop = noteTextareaRef.current.scrollHeight;
    }
  }, [note]);

  // Speech Recognition and Audio Recording Setup

  const setupAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      // Set up data collection at regular intervals
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };

      mediaRecorder.onstop = () => {
        setAudioChunks((prevChunks) => {
          if (prevChunks.length > 0) {
            const audioBlob = new Blob(prevChunks, {
              type: "audio/webm;codecs=opus",
            });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          }
          return prevChunks;
        });
      };

      audioRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error("Audio recording error:", error);
      setError("Failed to access microphone. Please check your permissions.");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setNote((prev) => prev + " " + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsRecording(false);
        };
      }
    }

    setupAudioRecording();
  }, []);

  useEffect(() => {
    if (isRecording) {
      setAudioChunks([]); // Clear previous chunks
      setAudioUrl(null); // Clear previous URL

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            toggleRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      if (audioRecorderRef.current) {
        // Start recording and collect data every 1 second
        audioRecorderRef.current.start(1000);
        recognitionRef.current?.start();
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        setRecordingTime(0);
      }

      if (audioRecorderRef.current?.state === "recording") {
        audioRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const queryClient = useQueryClient();

  const mutation = useMutation(uploadNote, {
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries("notes");
    },

    onError: (error) => {
      console.log(error);
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", note);
    formData.append("timestamp", new Date().toISOString());

    // Only append audio if we have chunks and recording was stopped manually
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    console.log(audioBlob);
    formData.append("audioBlob", audioBlob, "audio.webm");

    selectedImages.forEach((img) => {
      formData.append("images", img.file);
    });
    mutation.mutate(formData);

    // Reset states
    setTitle("");
    setNote("");
    setSelectedImages([]);
    setAudioChunks([]); // Clear audio chunks
    setAudioUrl(null);
    setIsDialogOpen(false);
    setIsRecording(false);
  };

  const handleClose = () => {
    setTitle("");
    setNote("");
    setSelectedImages([]);
    setAudioChunks([]); // Clear audio chunks
    setAudioUrl(null);
    setIsDialogOpen(false);
    setIsRecording(false);
    setRecordingTime(0); // Reset recording time
  };

  const toggleRecording = () => {
    if (!isRecording && recordingTime >= 60) {
      setError("Recording limit reached (1 minute). Please save or discard.");
      return;
    }
    setIsDialogOpen(true);
    setIsRecording(!isRecording);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const remainingSlots = 5 - selectedImages.length;
      const filesToAdd = Array.from(files).slice(0, remainingSlots);

      if (filesToAdd.length > 0) {
        const newImages = filesToAdd.map((file) => ({
          url: URL.createObjectURL(file),
          file: file,
        }));

        setSelectedImages((prev) => [...prev, ...newImages]);
      }

      if (files.length > remainingSlots) {
        setError("Maximum 5 images allowed");
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      if (newImages[index]) {
        URL.revokeObjectURL(newImages[index].url);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 fixed bottom-4 left-1/2 transform -translate-x-1/2">
      <div className="relative flex flex-col gap-2">
        <div className="relative flex items-center gap-2 bg-background rounded-full border shadow-sm p-2">
          <div className="flex gap-2 px-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsDialogOpen(true)}
            >
              <Pen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                selectedImages.length >= 5 && "opacity-50 cursor-not-allowed"
              )}
              onClick={() =>
                selectedImages.length < 5 && fileInputRef.current?.click()
              }
              disabled={selectedImages.length >= 5}
            >
              <ImageIcon className="h-4 w-4" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                disabled={selectedImages.length >= 5}
              />
            </Button>
          </div>
          <div className="flex-1 flex items-center">
            <div className="text-gray-400">Click pen to add a note...</div>
          </div>
          <Button
            className={cn(
              "rounded-full px-6",
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-500 hover:bg-red-600"
            )}
            onClick={toggleRecording}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop recording ({60 - recordingTime}s)
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start recording
              </>
            )}
          </Button>
        </div>

        {selectedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative inline-block">
                <div className="relative h-20 w-20">
                  <Image
                    src={image.url}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg border"
                  />
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -top-2 left-16 h-6 w-6 rounded-full"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            handleClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Add a Note {isRecording && `(Recording... ${recordingTime}s)`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleError(false);
                }}
                className={cn(
                  "col-span-4",
                  titleError && "border-red-500 focus:border-red-500"
                )}
                placeholder="Enter title"
              />
              {titleError && (
                <p className="col-span-4 text-red-500 text-sm">
                  Please enter a title
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                ref={noteTextareaRef}
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="col-span-4 max-h-40 overflow-y-auto"
                placeholder="Enter your note"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={mutation.isLoading}
              type="submit"
              onClick={handleSubmit}
            >
              {mutation.isLoading ? "Saving" : "Save"}
            </Button>
          </DialogFooter>
          {error && <Toast variant="destructive" title={error} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
