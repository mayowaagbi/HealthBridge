const entryService = require("../services/entryService");

class EntryController {
  static async createEntry(req, res) {
    try {
      const userId = req.user.id;
      const { mood, journal } = req.body;

      // Ensure mood or journal is provided
      if (!mood && !journal) {
        throw new Error("Either mood or journal must be provided.");
      }

      const entry = await entryService.createEntry(userId, mood, journal);
      return res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating entry:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  static async getEntries(req, res) {
    try {
      const userId = req.user.id;
      const entries = await entryService.getEntries(userId);
      return res.json(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EntryController;
