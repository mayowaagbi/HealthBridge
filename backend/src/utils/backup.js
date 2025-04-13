const { exec } = require("child_process");
const { promisify } = require("util");
const logger = require("./logger.js");
const execAsync = promisify(exec);

const createDatabaseBackup = async () => {
  const backupCommand = `pg_dump ${process.env.DATABASE_URL} > backup.sql`;

  try {
    await execAsync(backupCommand);
    logger.info("Database backup created successfully");
    return true;
  } catch (error) {
    logger.error(`Backup failed: ${error.message}`);
    return false;
  }
};
module.exports = { createDatabaseBackup };
