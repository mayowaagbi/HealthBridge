import { Button } from "../ui/button";
import { Calendar, FileText, Target, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickLinks() {
  return (
    <div className="grid gap-4 md:grid-cols-4 mt-6">
      <Button asChild>
        <Link to="/student/appointments">
          <Calendar className="mr-2 h-4 w-4" /> Book Appointment
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/student/health-records">
          <FileText className="mr-2 h-4 w-4" /> View Health Records
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/student/health-goals">
          <Target className="mr-2 h-4 w-4" /> Set New Goal
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/student/profile">
          <User className="mr-2 h-4 w-4" /> Update Profile
        </Link>
      </Button>
    </div>
  );
}
