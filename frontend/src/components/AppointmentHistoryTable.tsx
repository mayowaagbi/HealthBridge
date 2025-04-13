// src/components/AppointmentHistoryTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

interface AppointmentHistory {
  id: string;
  status: string;
  timestamp: string;
  changedBy: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

interface AppointmentHistoryTableProps {
  history: AppointmentHistory[];
}

export function AppointmentHistoryTable({
  history,
}: AppointmentHistoryTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Changed By</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <Badge variant="secondary">{entry.status}</Badge>
            </TableCell>
            <TableCell>
              {entry.changedBy.profile.firstName}{" "}
              {entry.changedBy.profile.lastName}
            </TableCell>
            <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
        {!history.length && (
          <TableRow>
            <TableCell
              colSpan={3}
              className="text-center text-muted-foreground"
            >
              No history available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
