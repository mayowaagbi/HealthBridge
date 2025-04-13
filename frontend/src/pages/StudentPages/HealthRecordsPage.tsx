import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { FileUp, Download, Trash } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Heart } from "lucide-react";
import { toast } from "react-hot-toast";

interface MedicalDocument {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

export default function StudentHealthRecordsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [records, setRecords] = useState<MedicalDocument[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Fetch records on component mount or refresh
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await api.get("/api/documents", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        // Ensure response.data is an array before setting state
        if (Array.isArray(response.data)) {
          setRecords(response.data);
        } else {
          console.error("Unexpected response:", response.data);
          setRecords([]); // Default to empty array if data is invalid
        }
      } catch (error) {
        console.error("Error fetching records:", error);
        setRecords([]); // Avoid undefined errors
        toast({
          title: "Error",
          description: "Failed to fetch health records",
          variant: "destructive",
        });
      }
    };

    fetchRecords();
  }, [refresh, toast]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Select a file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const formData = new FormData();
    console.log("Selected File:", selectedFile);
    formData.append("document", selectedFile);

    // Log FormData content
    console.log("FormData content:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/documents/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({ title: "Success", description: "File uploaded successfully" });
      setRefresh(!refresh);
      setSelectedFile(null);
      console.log("Upload response:", response.data);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  const handleDownload = async (documentId: string) => {
    try {
      const response = await api.get(`/api/documents/download/${documentId}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // Create a URL for the blob response
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = window.URL.createObjectURL(blob);

      // Extract the filename
      const documentRecord = records.find((d) => d.id === documentId);
      const filename =
        documentRecord?.filename ||
        `document.${response.headers["content-type"]?.split("/")[1] || "txt"}`;

      // Create and trigger the download link
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: " successfully Downloaded" });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  // Handle file deletion
  const handleDelete = async (documentId: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await api.delete(`/api/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        toast({ title: "Success", description: "File deleted successfully" });
        setRefresh(!refresh);
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error",
          description: "Failed to delete file",
          variant: "destructive",
        });
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link
          className="flex items-center justify-center"
          to="/student/dashboard"
        >
          <span className="sr-only">Campus Health Management System</span>
          <Heart className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">CHMS</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/appointments"
          >
            Appointments
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/health-goals"
          >
            Health Goals
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/notifications"
          >
            Notifications
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/student/profile"
          >
            Profile
          </Link>
        </nav>
      </header>

      <main className="flex-1 py-6 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Health Records</h1>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Record</CardTitle>
                <CardDescription>
                  Add a new health record to your file. Accepted formats: PDF,
                  JPEG, PNG (Max 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  encType="multipart/form-data"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpload();
                  }}
                >
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="document">Document</Label>
                    <Input
                      id="document"
                      name="document"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-500">
                      Selected file: {selectedFile.name} (
                      {formatFileSize(selectedFile.size)})
                    </p>
                  )}
                  <Button type="submit" disabled={!selectedFile || uploading}>
                    {uploading ? (
                      <>
                        {/* <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg> */}
                        <LoadingSpinner />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" /> Upload Record
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Your Health Records</CardTitle>
                <CardDescription>
                  View and manage your health documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.length > 0 ? (
                      records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.filename}
                          </TableCell>
                          <TableCell>{record.mimetype}</TableCell>
                          <TableCell>{formatFileSize(record.size)}</TableCell>
                          <TableCell>
                            {new Date(record.uploadedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(record.id)}
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(record.id)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
