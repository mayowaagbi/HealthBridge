const BaseModel = require("./BaseModel");

class User extends BaseModel {
  constructor() {
    super("user");
  }

  async findByEmail(email) {
    try {
      return await this.model.findUnique({
        where: { email },
        include: { profile: true },
      });
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  async createWithProfile(userData) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const userDataToCreate = {
          email: userData.email,
          passwordHash: userData.passwordHash,
          role: userData.role,
          profile: {
            create: {
              firstName: userData.profile?.firstName || null,
              lastName: userData.profile?.lastName || null,
              dateOfBirth: userData.profile?.dateOfBirth
                ? new Date(userData.profile.dateOfBirth)
                : null,
              phone: userData.profile?.phone || null,
              avatar: userData.profile?.avatar || null,
              bio: userData.profile?.bio || null,
            },
          },
        };

        // Step 1: Create the user with profile
        const user = await tx.user.create({
          data: userDataToCreate,
          include: { profile: true },
        });

        // Step 2: Based on Role, Create Related Records
        if (userData.role === "STUDENT") {
          await tx.studentDetails.create({
            data: {
              profileId: user.profile.id,
              studentId: `STU-${Date.now()}`, // Generate student ID
              insuranceNumber: userData.insuranceNumber || null,
            },
          });
        } else if (userData.role === "PROVIDER") {
          await tx.providerDetails.create({
            data: {
              profileId: user.profile.id,
              licenseNumber: userData.licenseNumber || `LIC-${Date.now()}`, // Generate license number
              specialization: userData.specialization || "General",
              department: userData.department || "Health Center",
            },
          });
        }

        return user;
      });
    } catch (error) {
      console.error("Error creating user with profile:", error);
      throw error;
    }
  }

  async getFullUser(id) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            studentDetails: true,
            providerDetails: true,
            emergencyContacts: true,
          },
        },
        sessions: true,
        notifications: true,
      },
    });
  }
  async updateStepGoal(userId, target) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { stepGoal: target },
    });
  }
  async getAllStudents() {
    return this.prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        profile: {
          select: {
            studentDetails: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }
  async getAllProviders() {
    return this.prisma.user.findMany({
      where: { role: "PROVIDER" },
      select: {
        id: true, // Provider ID
        profile: {
          select: {
            providerDetails: {
              select: {
                id: true, // ProviderDetails ID (if needed)
              },
            },
          },
        },
      },
    });
  }
  async countStudents() {
    return this.prisma.user.count({
      where: { role: "STUDENT" },
    });
  }
}

module.exports = new User();
