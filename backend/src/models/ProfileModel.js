// // src/models/ProfileModel.js
// const BaseModel = require("./BaseModel");

// class ProfileModel extends BaseModel {
//   constructor() {
//     super("profile");
//   }

//   async findByUserId(userId) {
//     return this.prisma.profile.findUnique({
//       where: { userId },
//       include: {
//         emergencyContacts: true,
//         studentDetails: true,
//       },
//     });
//   }

//   async updateProfile(userId, data) {
//     return this.prisma.profile.update({
//       where: { userId },
//       data,
//       include: { emergencyContacts: true },
//     });
//   }

//   async createProfile(data) {
//     return this.prisma.profile.create({
//       data,
//       include: { emergencyContacts: true },
//     });
//   }
// }

// module.exports = ProfileModel;
// src/models/Profile.js
const BaseModel = require("./BaseModel");

class Profile extends BaseModel {
  constructor() {
    super("profile");
  }

  async findByUserId(userId) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              email: true, // Include the email from the User table
            },
          },
          emergencyContacts: true, // Include emergency contacts
        },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      console.log("Retrieved profile:", profile);
      return profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  }

  async updateProfile(userId, data) {
    console.log(`model${data}`);
    return this.prisma.profile.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        bloodType: data.bloodType,
        allergies: data.allergies,
        notifyEmail: data.notifyEmail,
        notifySms: data.notifySms,
        notifyPush: data.notifyPush,
        emergencyContacts: {
          // Update existing contacts
          updateMany: data.emergencyContacts
            .filter((contact) => contact.id) // Only update contacts with an ID
            .map((contact) => ({
              where: { id: contact.id },
              data: {
                name: contact.name,
                phone: contact.phone,
                relationship: contact.relationship,
              },
            })),
          // Create new contacts
          create: data.emergencyContacts
            .filter((contact) => !contact.id) // Only create contacts without an ID
            .map((contact) => ({
              name: contact.name,
              phone: contact.phone,
              relationship: contact.relationship || "Unknown", // Default value
            })),
        },
      },
      include: {
        emergencyContacts: true, // Include updated contacts in the response
      },
    });
  }
}

module.exports = Profile;
