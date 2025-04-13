const entryModel = require("../models/entryModel");

class EntryService {
  async createEntry(userId, mood, journal) {
    if (!userId || (!mood && !journal)) {
      throw new Error("Missing required fields");
    }
    return entryModel.createEntry(userId, mood, journal);
  }

  async getEntries(userId) {
    return entryModel.getEntries(userId);
  }
}

module.exports = new EntryService();
