const BaseModel = require("./BaseModel");

class AmbulanceModel extends BaseModel {
  constructor() {
    super("ambulanceRequest");
  }

  /**
   * Create a new ambulance request.
   */
  async createRequest(data) {
    return this.prisma.ambulanceRequest.create({
      data: {
        ...data,
        status: "PENDING", // Default status
      },
    });
  }

  /**
   * Get all ambulance requests for a specific user.
   */
  async getRequestsByUser(userId) {
    return this.prisma.ambulanceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get all ambulance requests with optional filtering, sorting, and pagination.
   */
  async findMany(options = {}) {
    const { where, orderBy, skip, take } = options;
    return this.prisma.ambulanceRequest.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        user: {
          include: {
            profile: true, // Include the user's profile data
          },
        },
      },
    });
  }

  /**
   * Update the status of an ambulance request.
   */
  async updateStatus(id, status) {
    return this.prisma.ambulanceRequest.update({
      where: { id },
      data: { status },
    });
  }
}

module.exports = new AmbulanceModel();
