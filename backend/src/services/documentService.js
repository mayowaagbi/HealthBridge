const MedicalDocumentModel = require("../models/MedicalDocument");

class DocumentService {
  async createDocument(studentId, file) {
    try {
      return await MedicalDocumentModel.create({
        studentId,
        filename: file.name,
        path: file.tempFilePath,
        mimetype: file.mimetype,
        size: file.size,
      });
    } catch (error) {
      console.error("Create error:", error);
      throw new Error("Document creation failed: " + error.message);
    }
  }

  async getDocuments(studentId) {
    try {
      return await MedicalDocumentModel.findMany({ where: { studentId } });
    } catch (error) {
      console.error("Get documents error:", error);
      throw new Error("Failed to retrieve documents");
    }
  }

  async getDocumentById(documentId) {
    try {
      return await MedicalDocumentModel.findById(documentId);
    } catch (error) {
      console.error("Get document by ID error:", error);
      throw new Error("Failed to retrieve document");
    }
  }

  async deleteDocument(documentId) {
    try {
      return await MedicalDocumentModel.delete(documentId);
    } catch (error) {
      console.error("Delete document error:", error);
      throw new Error("Failed to delete document");
    }
  }
  async recentUploads() {
    try {
      return await MedicalDocumentModel.getRecentUploads();
    } catch (error) {
      console.error("Error fetching recent uploads:", error);
      throw new Error("Failed to fetch recent uploads");
    }
  }
  async getAllDocuments() {
    try {
      const documents = MedicalDocumentModel.getAllHealthRecords();
      return documents;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw new Error("Failed to fetch documents");
    }
  }
}

module.exports = new DocumentService();
