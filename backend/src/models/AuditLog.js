const BaseModel = require("./BaseModel");

class AuditLog extends BaseModel {
  constructor() {
    super("auditLog");
  }

  /**
   * Record audit event with full context
   * @param {Object} params
   * @param {string} [params.userId] - ID of acting user
   * @param {string} params.actionType - CRUD operation type
   * @param {string} params.targetType - Affected entity type
   * @param {string} [params.targetId] - Affected entity ID
   * @param {Object} [params.metadata] - Additional context
   * @param {string} [params.ipAddress] - Origin IP
   * @returns {Promise<Object>} Created audit entry
   */
  async recordEvent({
    userId,
    actionType,
    targetType,
    targetId,
    metadata,
    ipAddress,
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        actionType: actionType.toUpperCase(),
        targetType,
        targetId,
        metadata: metadata || {},
        ipAddress,
        description: this._generateDescription(actionType, targetType),
      },
    });
  }

  /**
   * Query audit logs with advanced filtering
   * @param {Object} filters
   * @param {string} [filters.userId]
   * @param {string} [filters.actionType]
   * @param {string} [filters.targetType]
   * @param {Date} [filters.startDate]
   * @param {Date} [filters.endDate]
   * @param {number} [page=1]
   * @param {number} [pageSize=50]
   * @returns {Promise<Object>} Paginated results
   */
  async queryLogs(filters = {}, page = 1, pageSize = 50) {
    const { userId, actionType, targetType, startDate, endDate } = filters;
    const skip = (page - 1) * pageSize;

    return this.prisma.auditLog.findMany({
      where: {
        userId,
        actionType: actionType?.toUpperCase(),
        targetType,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, role: true } } },
    });
  }

  /**
   * Archive logs older than specified date
   * @param {Date} cutoffDate
   * @returns {Promise<Object>} Archive summary
   */
  async archiveOldEntries(cutoffDate) {
    return this.prisma.$transaction([
      this.prisma.auditLog.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      }),
    ]);
  }

  /**
   * Generate human-readable description
   * @private
   */
  _generateDescription(actionType, targetType) {
    const actions = {
      CREATE: "Created new",
      UPDATE: "Modified existing",
      DELETE: "Removed",
      ACCESS: "Accessed",
    };
    return `${actions[actionType] || "Performed action on"} ${targetType}`;
  }
}

module.exports = new AuditLog();
