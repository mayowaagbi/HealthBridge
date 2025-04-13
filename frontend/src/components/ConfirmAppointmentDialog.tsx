import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { format } from "date-fns";

interface ConfirmAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointmentData: {
    service: string;
    startTime: Date;
    notes?: string;
  };
}

export function ConfirmAppointmentDialog({
  isOpen,
  onClose,
  onConfirm,
  appointmentData,
}: ConfirmAppointmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>
            Please review your appointment details before confirming.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            <strong>Service:</strong> {appointmentData.service}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {format(appointmentData.startTime, "MMMM d, yyyy")}
          </p>
          <p>
            <strong>Time:</strong> {format(appointmentData.startTime, "h:mm a")}
          </p>
          {appointmentData.notes && (
            <p>
              <strong>Notes:</strong> {appointmentData.notes}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
