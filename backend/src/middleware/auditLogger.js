const { AuditLog } = require("../models/AuditLog");
/**
 * Audit logging middleware
 */
const auditLogger = async (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      await AuditLog.recordEvent({
        userId: req.user?.id,
        actionType: req.method,
        targetType: req.baseUrl,
        targetId: req.params.id,
        metadata: {
          statusCode: res.statusCode,
          duration: Date.now() - start,
        },
        ipAddress: req.ip,
      });
    } catch (err) {
      console.error("Audit log failed:", err);
    }
  });

  next();
};

module.exports = { auditLogger };
