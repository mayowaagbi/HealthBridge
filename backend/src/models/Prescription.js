const BaseModel = require("./BaseModel");

class Prescription extends BaseModel {
  constructor() {
    super("prescription");
  }

  /**
   * Create prescription with validation
   * @param {string} recordId
   * @param {Object} prescriptionData
   * @returns {Promise<Object>}
   */
  async createPrescription(
    recordId,
    { medication, dosage, instructions, refills }
  ) {
    return this.prisma.prescription.create({
      data: {
        record: { connect: { id: recordId } },
        medication,
        dosage,
        instructions,
        refills: parseInt(refills) || 0,
      },
    });
  }

  /**
   * Process prescription refill
   * @param {string} prescriptionId
   * @returns {Promise<Object>}
   */
  async processRefill(prescriptionId) {
    return this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: { refills: { decrement: 1 } },
    });
  }
}

module.exports = new Prescription();
