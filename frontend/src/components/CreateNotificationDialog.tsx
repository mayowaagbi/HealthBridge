import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";

interface CreateNotificationDialogProps {
  onCreate: (data: { title: string; content: string; userId: string }) => void;
}

export function CreateNotificationDialog({
  onCreate,
}: CreateNotificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!title || !content || !userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill out all fields.",
      });
      return;
    }

    onCreate({ title, content, userId });
    setOpen(false);
    setTitle("");
    setContent("");
    setUserId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Notification</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Notification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>
          <div>
            <Label>Content</Label>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter content"
            />
          </div>
          <div>
            <Label>User ID</Label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
          </div>
          <Button onClick={handleSubmit}>Send Notification</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
