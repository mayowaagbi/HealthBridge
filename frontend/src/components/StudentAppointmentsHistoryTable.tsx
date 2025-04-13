// src/components/StudentAppointmentsTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

interface Appointment {
  id: string;
  startTime: string;
  service: string;
  status: string;
  provider?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  support?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

interface StudentAppointmentsTableProps {
  historyappointments: Appointment[];
}

export function StudentAppointmentsHistoryTable({
  historyappointments,
}: StudentAppointmentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date/Time</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Support</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {historyappointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell>
              {new Date(appointment.startTime).toLocaleString()}
            </TableCell>
            <TableCell>{appointment.service}</TableCell>
            <TableCell>
              <Badge variant="secondary">{appointment.status}</Badge>
            </TableCell>
            <TableCell>
              {appointment.provider
                ? `${appointment.provider.profile.firstName} ${appointment.provider.profile.lastName}`
                : "N/A"}
            </TableCell>
            <TableCell>
              {appointment.support
                ? `${appointment.support.profile.firstName} ${appointment.support.profile.lastName}`
                : "N/A"}
            </TableCell>
          </TableRow>
        ))}
        {!historyappointments.length && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              No appointments found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
