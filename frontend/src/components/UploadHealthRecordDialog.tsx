import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";

interface UploadHealthRecordDialogProps {
  onUploadSuccess?: () => void;
}

export function UploadHealthRecordDialog({
  onUploadSuccess,
}: UploadHealthRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  interface Patient {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  }

  const [patients, setPatients] = useState<Patient[]>([]); // Initialize as an empty array

  const form = useForm({
    defaultValues: {
      patientId: "",
      recordType: "",
      file: null,
    },
  });

  // Fetch patients when the dialog opens
  useEffect(() => {
    if (open) {
      fetchPatients();
    }
  }, [open]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get("/api/patients");
      // Ensure the response data is an array
      if (Array.isArray(response.data)) {
        setPatients(response.data);
      } else {
        console.error("Invalid patients data format:", response.data);
        toast.error("Failed to load patients: Invalid data format");
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast.error("Failed to load patients");
    }
  };

  interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleFileChange = (event: FileChangeEvent) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  interface FormData {
    patientId: string;
    recordType: string;
    file: File | null;
  }

  const onSubmit = async (data: FormData) => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", data.patientId);
    formData.append("recordType", data.recordType);

    try {
      const response = await axios.post(
        "/api/health-records/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      toast.success("Health record uploaded successfully");
      setOpen(false);
      onUploadSuccess?.(); // Refresh the parent component
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload health record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Upload Health Record</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Health Record</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {`${patient.profile.firstName} ${patient.profile.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recordType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a record type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Blood Test">Blood Test</SelectItem>
                      <SelectItem value="X-Ray">X-Ray</SelectItem>
                      <SelectItem value="Vaccination Record">
                        Vaccination Record
                      </SelectItem>
                      <SelectItem value="Mental Health Assessment">
                        Mental Health Assessment
                      </SelectItem>
                      <SelectItem value="Allergy Test">Allergy Test</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>File</FormLabel>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <FormMessage />
            </FormItem>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
