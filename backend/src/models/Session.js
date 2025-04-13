const BaseModel = require("./BaseModel");

class Session extends BaseModel {
  constructor() {
    super("session");
  }

  /**
   * Create session with expiration
   * @param {string} userId
   * @param {Date} expiresAt
   * @param {Object} deviceInfo
   * @returns {Promise<Object>}
   */
  async createSession(userId, expiresAt, { userAgent, ipAddress }) {
    return this.prisma.session.create({
      data: {
        user: { connect: { id: userId } },
        expiresAt: new Date(expiresAt),
        userAgent,
        ipAddress,
      },
    });
  }

  /**
   * Invalidate all sessions for user
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async invalidateAllSessions(userId) {
    return this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  /**
   * Cleanup expired sessions
   * @returns {Promise<Object>}
   */
  async cleanupExpiredSessions() {
    return this.prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}

module.exports = new Session();
