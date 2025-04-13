// const { Notification, User } = require("../models");
// const { sendEmail } = require("../utils/mailer");
// const { sendSMS } = require("../utils/smsService");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
// class NotificationService {
//   async sendBulkNotification(userIds, message) {
//     const notifications = await Notification.batchCreate(userIds, message);
//     await this._dispatchNotifications(userIds, message);
//     return notifications;
//   }

//   async _dispatchNotifications(userIds, message) {
//     const users = await User.findMany({ where: { id: { in: userIds } } });

//     await Promise.all([
//       this._sendEmails(users, message),
//       this._sendSMS(users, message),
//     ]);
//   }

//   // async _sendEmails(users, message) {
//   //   const emailPromises = users.map((user) =>
//   //     sendEmail(user.email, "Health Notification", message)
//   //   );
//   //   await Promise.all(emailPromises);
//   // }

//   // async sendStepAlert(userId) {
//   //   const user = await prisma.user.findUnique({
//   //     where: { id: userId },
//   //     select: { phone: true, stepGoal: true },
//   //   });

//   //   const stepsEntry = await prisma.stepEntry.findUnique({
//   //     where: { userId_date: { userId, date: new Date() } },
//   //   });

//   //   if (stepsEntry.steps >= user.stepGoal) {
//   //     await sendSMS(
//   //       user.phone,
//   //       `🎉 Goal Achieved! You've reached ${stepsEntry.steps} steps today!`
//   //     );
//   //   }
//   // }
// }

// module.export = new NotificationService();
// src/services/NotificationService.js
const NotificationModel = require("../models/Notification");

class NotificationService {
  // async createNotification(data) {
  //   return await NotificationModel.create({
  //     ...data,
  //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
  //   });
  // }

  async getUserNotifications(userId) {
    return await NotificationModel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id) {
    return await NotificationModel.update({ id }, { read: true });
  }

  async deleteNotification(id) {
    return await NotificationModel.delete({ id });
  }
  async getallNotifications() {
    return NotificationModel.findMany();
  }

  async createNotification(data) {
    return NotificationModel.create({
      ...data,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    });
  }
}

module.exports = NotificationService;
