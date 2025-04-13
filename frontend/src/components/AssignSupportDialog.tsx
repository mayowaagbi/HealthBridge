import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserPlus } from "lucide-react";

export type Support = {
  id: string;
  name: string;
  specialization?: string;
  availability?: string;
};
interface AssignSupportDialogProps {
  supports: Support[];
  onAssign: (supportId: string) => void;
}

export const AssignSupportDialog = ({
  supports,
  onAssign,
}: AssignSupportDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-2 font-normal"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Support
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-60 overflow-y-auto">
        {supports.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No support staff available
          </DropdownMenuItem>
        ) : (
          supports.map((support) => (
            <DropdownMenuItem
              key={support.id}
              onSelect={() => {
                onAssign(support.id);
                setOpen(false);
              }}
            >
              {support.name}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
