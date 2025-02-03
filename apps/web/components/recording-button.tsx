"use client";

import { Button } from "@workspace/ui/components/button";
import { Mic } from "lucide-react";
import { useState } from "react";

export function RecordingButton() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <Button
      size="lg"
      variant={isRecording ? "destructive" : "default"}
      className="fixed bottom-4 right-4 gap-2"
      onClick={() => setIsRecording(!isRecording)}
    >
      <Mic className="h-4 w-4" />
      {isRecording ? "Stop recording" : "Start recording"}
    </Button>
  );
}
