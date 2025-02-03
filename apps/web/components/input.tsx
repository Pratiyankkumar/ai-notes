"use client";

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
import { Pen, ImageIcon, X, Mic, MicOff, Play, Pause } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Toast } from "@workspace/ui/components/toast";

interface AudioWaveformProps {
  audioChunks: Blob[];
  isRecording: boolean;
}

interface AudioWaveformProps {
  audioChunks: Blob[];
}

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error?: any;
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

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioChunks,
  isRecording,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const drawWaveform = () => {
      if (!isRecording) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(255, 0, 0, 0.5)";

      const centerY = canvas.height / 2;
      const width = canvas.width;

      context.beginPath();
      context.moveTo(0, centerY);

      // Use a sine wave for a more natural, slower animation
      for (let x = 0; x < width; x++) {
        const amplitude = Math.sin(x * 0.05 + Date.now() * 0.01) * 20;
        context.lineTo(x, centerY + amplitude);
      }

      context.strokeStyle = "red";
      context.lineWidth = 2;
      context.stroke();

      animationFrameRef.current = requestAnimationFrame(drawWaveform);
    };

    if (isRecording) {
      drawWaveform();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className="w-full bg-gray-100 rounded-lg"
    />
  );
};

export default function VoiceNoteInput() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [titleError, setTitleError] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-scroll effect for textarea
  useEffect(() => {
    if (noteTextareaRef.current) {
      noteTextareaRef.current.scrollTop = noteTextareaRef.current.scrollHeight;
    }
  }, [noteTextareaRef]); //Fixed unnecessary dependency

  // Speech Recognition and Audio Recording Setup
  useEffect(() => {
    // Speech Recognition Setup
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

    // Audio Recording Setup
    const setupAudioRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks((prev) => [...prev, event.data]);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
        };

        audioRecorderRef.current = mediaRecorder;
      } catch (error) {
        console.error("Audio recording error:", error);
        setError("Failed to access microphone. Please check your permissions.");
      }
    };

    setupAudioRecording();
  }, []);

  // Recording and Timer Effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            toggleRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      audioRecorderRef.current?.start();
      recognitionRef.current?.start();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        setRecordingTime(0);
      }

      audioRecorderRef.current?.stop();
      recognitionRef.current?.stop();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Audio Playback Control
  const toggleAudioPlayback = () => {
    const audioElement = audioPlayerRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const noteData = {
      title: title.trim(),
      content: note,
      image: selectedImage,
      audioBlob:
        audioChunks.length > 0
          ? new Blob(audioChunks, { type: "audio/webm" })
          : null,
      timestamp: new Date().toISOString(),
    };

    // TODO: Implement database save logic
    console.log("Saving note:", noteData);

    // Reset states
    setTitle("");
    setNote("");
    setSelectedImage(null);
    setAudioChunks([]);
    setAudioUrl(null);
    setIsDialogOpen(false);
    setIsRecording(false);
  };

  const handleClose = () => {
    setTitle("");
    setNote("");
    setSelectedImage(null);
    setAudioChunks([]);
    setAudioUrl(null);
    setIsDialogOpen(false);
    setIsRecording(false);
    console.log("Closed");
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
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
              className="h-8 w-8 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
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

        {selectedImage && (
          <div className="relative inline-block overflow-hidden transition-all duration-300">
            <div className="relative h-20 w-20">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover rounded-lg border"
              />
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-2 left-16 h-6 w-6 rounded-full"
              onClick={removeImage}
            >
              <X className="h-3 w-3 " />
            </Button>
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

            {/* Waveform and Audio Playback */}
            {isRecording && (
              <AudioWaveform
                audioChunks={audioChunks}
                isRecording={isRecording}
              />
            )}

            {audioUrl && (
              <div className="flex items-center space-x-2 mt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAudioPlayback}
                >
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
                <audio
                  ref={audioPlayerRef}
                  src={audioUrl}
                  onEnded={handleAudioEnded}
                />
                <span>{isPlaying ? "Playing" : "Audio Recorded"}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmit}>
              Save note
            </Button>
          </DialogFooter>
          {/* Error Toast */}
          {error && <Toast variant="destructive" title="Error" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
