const DocumentService = require("../services/documentService");
const StudentService = require("../services/studentService");
const fs = require("fs");
const path = require("path");

class DocumentController {
  async uploadDocument(req, res) {
    try {
      if (!req.files || !req.files.document) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.files.document;
      console.log("File received:", file);

      // Get student through service
      const student = await StudentService.findStudentByUserId(req.user.id);

      if (!student) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      const document = await DocumentService.createDocument(student.id, file);

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        document: document,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed", details: error.message });
    }
  }

  async getDocuments(req, res) {
    try {
      const student = await StudentService.findStudentByUserId(req.user.id);

      if (!student) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      const documents = await DocumentService.getDocuments(student.id);
      res.json(documents);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch documents", details: error.message });
    }
  }

  async downloadDocument(req, res) {
    try {
      const document = await DocumentService.getDocumentById(req.params.id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      const filePath = path.resolve(document.path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on server" });
      }

      res.setHeader("Content-Type", document.mimetype);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(document.filename)}"`
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download error:", error);
      res
        .status(500)
        .json({ error: "File download failed", details: error.message });
    }
  }

  async deleteDocument(req, res) {
    try {
      const document = await DocumentService.deleteDocument(req.params.id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      fs.unlinkSync(document.path);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      res
        .status(500)
        .json({ error: "Document deletion failed", details: error.message });
    }
  }
  async getAllDocuments(req, res) {
    try {
      const documents = await DocumentService.getAllDocuments();
      res.status(200).json(documents);
    } catch (error) {
      console.error("Error in getAllDocuments:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DocumentController();
