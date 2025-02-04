"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@workspace/ui/components/dialog";
import {
  Copy,
  Download,
  Edit,
  Eye,
  Expand,
  Maximize2,
  MoreHorizontal,
  Play,
  Pause,
  Star,
  Trash,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Image,
} from "lucide-react";
import TextEditor from "./editor";

interface NoteCardProps {
  title: string;
  content: string;
  date: string;
  duration?: string;
  type: "audio" | "text";
  initialImages?: string[];
  audioUrl?: string;
  favorite: boolean;
}

export function NoteCard({
  title,
  content,
  date,
  type,
  initialImages = [],
  audioUrl,
  favorite,
}: NoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(favorite);
  const [isEditing, setIsEditing] = useState(true);
  const [editedContent, setEditedContent] = useState(content);
  const [editedTitle, setEditedTitle] = useState<string>(title);
  const [noteImages, setNoteImages] = useState<string[]>(initialImages);
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState<string>("00:00");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);

      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(formatTime(audioRef.current.duration));
        }
      });

      audioRef.current.addEventListener("timeupdate", updateProgress);
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setProgress(0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateProgress);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const currentSeconds = audioRef.current.currentTime;
      const durationSeconds = audioRef.current.duration;
      setCurrentTime(formatTime(currentSeconds));
      setProgress((currentSeconds / durationSeconds) * 100);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const percentageClicked = (clickPosition / rect.width) * 100;
      const newTime = (audioRef.current.duration * percentageClicked) / 100;

      audioRef.current.currentTime = newTime;
      setProgress(percentageClicked);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && noteImages.length < 5) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNoteImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setNoteImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };

  function handleSave() {
    console.log({
      editedTitle,
      editedContent,
      noteImages,
    });
  }

  const openImageViewer = (index: number) => {
    if (!isEditing) {
      setSelectedImageIndex(index);
      setIsImageViewerOpen(true);
    }
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (selectedImageIndex === null || !noteImages.length) return;

    let newIndex;
    if (direction === "prev") {
      newIndex =
        selectedImageIndex === 0
          ? noteImages.length - 1
          : selectedImageIndex - 1;
    } else {
      newIndex =
        selectedImageIndex === noteImages.length - 1
          ? 0
          : selectedImageIndex + 1;
    }
    setSelectedImageIndex(newIndex);
  };

  return (
    <>
      <Card
        className="group w-[350px] h-[300px] flex flex-col cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="p-4 h-[80%]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{title}</h3>
                {audioUrl && (
                  <span className="text-xs px-[6px] py-[3px] text-black bg-gray-200 rounded-full text-muted-foreground flex justify-center items-center gap-1">
                    <Play className="h-3 w-3 text-black" /> {duration}
                  </span>
                )}
              </div>
              <div
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={createMarkup(content)}
              />
              {noteImages.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Image className="h-3 w-3" />
                  <span>
                    {noteImages.length} Image
                    {noteImages.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-4 flex flex-row justify-between w-full border-t text-xs text-muted-foreground">
          <p>{date}</p>
          <div className="flex flex-row items-center gap-2">
            <Copy
              className="h-4 w-4 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
            <Trash
              className="h-4 w-4 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={`
            max-w-3xl max-h-[100vh] p-0 overflow-y-auto
            ${isFullScreen ? "!max-w-full !h-screen !rounded-none" : ""}
          `}
        >
          <DialogHeader className="flex flex-row items-center justify-between p-4 overflow-y-auto">
            <div className="flex items-center fixed top-2 right-[44px] gap-2">
              <Button
                size="icon"
                variant={favorite ? "default" : "ghost"}
                onClick={toggleFavorite}
                className="text-yellow-500"
              >
                <Star className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" onClick={toggleFullScreen}>
                {isFullScreen ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Expand className="h-3 w-3" />
                )}
              </Button>
            </div>
          </DialogHeader>

          {!isEditing && noteImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
              {noteImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => openImageViewer(index)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Note attachment ${index + 1}`}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              {isEditing ? (
                <input
                  value={editedTitle}
                  className="text-xl font-semibold w-full border rounded px-2 py-1"
                  onChange={(e) => {
                    setEditedTitle(e.target.value);
                  }}
                />
              ) : (
                <h2 className="text-xl font-semibold">{title}</h2>
              )}
            </div>

            {type === "audio" && audioUrl && (
              <div className="flex items-center gap-4 w-full bg-secondary/20 p-4 rounded-lg mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-full">
                  <div
                    className="w-full bg-muted rounded-full h-1 cursor-pointer"
                    onClick={handleProgressBarClick}
                    ref={progressBarRef}
                  >
                    <div
                      className="bg-primary h-1 rounded-full relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="h-3 w-3 rounded-full bg-primary absolute right-0 -top-1" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span>{currentTime}</span>
                  <span>/</span>
                  <span>{duration}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={!isEditing ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              <Button
                variant={isEditing ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>

            {isEditing ? (
              <div className="">
                <TextEditor
                  onEditContent={setEditedContent}
                  content={editedContent}
                />
              </div>
            ) : (
              <div
                className="text-sm text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={createMarkup(editedContent)}
              />
            )}

            {noteImages.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {noteImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group"
                    onMouseEnter={() => setHoveredImageIndex(index)}
                    onMouseLeave={() => setHoveredImageIndex(null)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-24 aspect-square p-0 relative group"
                    >
                      <img
                        src={image}
                        alt={`Note attachment ${index + 1}`}
                        className="rounded-lg w-full h-full object-cover"
                      />
                      {(isEditing || hoveredImageIndex === index) && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-0 right-0 z-10 bg-transparent"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4 text-white" />
                        </Button>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="w-full flex flex-row justify-between">
              {isEditing && noteImages.length < 5 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 mr-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Upload Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
              <Button
                onClick={handleSave}
                variant={"default"}
                size={"default"}
                className="mt-4"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageViewerOpen} onOpenChange={closeImageViewer}>
        <DialogContent className="max-w-4xl p-0 bg-black/90">
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {selectedImageIndex !== null && noteImages[selectedImageIndex] && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("prev");
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <img
                  src={noteImages[selectedImageIndex]}
                  alt={`Note attachment ${selectedImageIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage("next");
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                  {selectedImageIndex + 1} / {noteImages.length}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                  onClick={closeImageViewer}
                >
                  <X className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
