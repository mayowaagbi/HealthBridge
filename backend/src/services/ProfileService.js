// src/services/ProfileService.js
const { Profile } = require("../models");

class ProfileService {
  constructor() {
    this.profileModel = new Profile();
  }

  async getProfile(userId) {
    const profile = await this.profileModel.findByUserId(userId);
    if (!profile) throw new Error("Profile not found");
    return profile;
  }

  async updateProfileservice(userId, data) {
    console.log(`service${data}`);
    // console.log("Service:", JSON.stringify(service));
    return this.profileModel.updateProfile(userId, data);
  }
}

module.exports = ProfileService;
