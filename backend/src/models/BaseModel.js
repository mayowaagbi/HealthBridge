// const { PrismaClient } = require("@prisma/client");
const prisma = require("../config/database");
console.log("Available Prisma Models:", Object.keys(prisma));
class BaseModel {
  constructor(modelName) {
    if (!prisma[modelName]) {
      throw new Error(`Model "${modelName}" does not exist in Prisma Client.`);
    }
    this.model = prisma[modelName];
    this.prisma = prisma;
  }

  /**
   * Find a record by its ID.
   */
  async findById(id, include = null) {
    try {
      const record = await this.model.findUnique({
        where: { id },
        include,
      });

      if (!record) {
        throw new Error(`Record with ID ${id} not found.`);
      }

      return record;
    } catch (error) {
      console.error(`Error finding record by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find all records matching the criteria.
   */
  async findAll({
    where = {},
    include = null,
    skip = 0,
    take = 100,
    orderBy = null,
  }) {
    try {
      return await this.model.findMany({
        where,
        include,
        skip,
        take,
        orderBy,
      });
    } catch (error) {
      console.error("Error finding records:", error);
      throw error;
    }
  }

  /**
   * Create a new record.
   */
  async create(data) {
    try {
      return await this.model.create({ data });
    } catch (error) {
      console.error("Error creating record:", error);
      throw error;
    }
  }

  /**
   * Update a record by its ID.
   */
  async update(id, data) {
    try {
      const record = await this.model.update({
        where: { id },
        data,
      });

      if (!record) {
        throw new Error(`Record with ID ${id} not found.`);
      }

      return record;
    } catch (error) {
      console.error(`Error updating record with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record by its ID.
   */
  async delete(id) {
    try {
      const record = await this.model.delete({
        where: { id },
      });

      if (!record) {
        throw new Error(`Record with ID ${id} not found.`);
      }

      return record;
    } catch (error) {
      console.error(`Error deleting record with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect the Prisma client.
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = BaseModel;
