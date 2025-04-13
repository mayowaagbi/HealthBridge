// const BaseModel = require("./BaseModel");

// class HealthRecord extends BaseModel {
//   constructor() {
//     super("healthRecord");
//   }

//   /**
//    * Create a new health record with prescriptions
//    * @param {Object} recordData - Health record data
//    * @param {Array} prescriptions - Array of prescriptions
//    * @returns {Promise<Object>} Created health record
//    */
//   async createWithPrescriptions(recordData, prescriptions = []) {
//     return this.prisma.healthRecord.create({
//       data: {
//         ...recordData,
//         prescriptions: {
//           create: prescriptions,
//         },
//       },
//       include: {
//         prescriptions: true,
//         documents: true,
//       },
//     });
//   }

//   /**
//    * Add document to health record
//    * @param {string} recordId - UUID of health record
//    * @param {Object} documentData - Document metadata
//    * @returns {Promise<Object>} Created document
//    */
//   async addDocument(recordId, documentData) {
//     return this.prisma.medicalDocument.create({
//       data: {
//         record: { connect: { id: recordId } },
//         ...documentData,
//       },
//     });
//   }

//   /**
//    * Get complete medical history for a student
//    * @param {string} studentId - UUID of the student
//    * @param {number} page - Pagination page number
//    * @param {number} pageSize - Number of records per page
//    * @returns {Promise<Object>} Paginated medical history
//    */
//   async getMedicalHistory(studentId, page = 1, pageSize = 10) {
//     const skip = (page - 1) * pageSize;
//     return this.prisma.healthRecord.findMany({
//       where: { studentId },
//       skip,
//       take: pageSize,
//       include: {
//         provider: {
//           include: {
//             profile: true,
//           },
//         },
//         prescriptions: true,
//         documents: true,
//       },
//       orderBy: { recordedAt: "desc" },
//     });
//   }
// }

// module.exports = new HealthRecord();
