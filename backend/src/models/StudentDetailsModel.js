// // models/StudentDetailsModel.js
// const BaseModel = require("./BaseModel");

// class StudentDetailsModel extends BaseModel {
//   constructor() {
//     super("studentDetails");
//   }

//   async countByProvider(providerId) {
//     return this.prisma.studentDetails.count({
//       where: { primaryCareProviderId: providerId },
//     });
//   }
// }

// module.exports = new StudentDetailsModel();
