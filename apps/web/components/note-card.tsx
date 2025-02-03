import { Card, CardContent, CardFooter } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Image, MoreHorizontal, Play } from "lucide-react";

interface NoteCardProps {
  title: string;
  content: string;
  date: string;
  duration?: string;
  type: "audio" | "text";
  hasImage?: boolean;
}

export function NoteCard({
  title,
  content,
  date,
  duration,
  type,
  hasImage,
}: NoteCardProps) {
  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{title}</h3>
              {duration && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Play className="h-3 w-3" /> {duration}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{content}</p>
            {hasImage && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Image className="h-3 w-3" />
                <span>1 Image</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-2 border-t text-xs text-muted-foreground">
        {date}
      </CardFooter>
    </Card>
  );
}
