// const { NotificationService } = require("../services");
// const { successResponse, errorResponse } = require("../utils/responseHandler");
// const asyncHandler = require("../utils/asyncHandler");

// class NotificationController {
//   getNotifications = asyncHandler(async (req, res) => {
//     const notifications = await NotificationService.getUserNotifications(
//       req.user.id
//     );
//     successResponse(res, notifications);
//   });

//   markAsRead = asyncHandler(async (req, res) => {
//     await NotificationService.markNotificationsAsRead(
//       req.user.id,
//       req.body.ids
//     );
//     successResponse(res, { message: "Notifications marked as read" });
//   });

//   sendNotification = asyncHandler(async (req, res) => {
//     const { title, message, recipients } = req.body;
//     await NotificationService.sendNotification(title, message, recipients);
//     successResponse(res, { message: "Notification sent successfully" });
//   });
// }

// module.exports = new NotificationController();
// src/controllers/NotificationController.js
const NotificationService = require("../services/NotificationService");

class NotificationController {
  constructor() {
    this.service = new NotificationService();
  }

  // async createNotification(req, res) {
  //   try {
  //     const notification = await this.service.createNotification(req.body);

  //     // Broadcast to specific user
  //     req.app
  //       .get("io")
  //       .to(req.body.userId)
  //       .emit("new-notification", notification);
  //     res.status(201).json(notification);
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }
  async getallNotifications(req, res) {
    try {
      const notifications = await NotificationService.getallNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createNotification(req, res) {
    try {
      const { title, content, userId } = req.body;
      const notification = await NotificationService.createNotification({
        title,
        content,
        userId,
      });
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  // async getNotifications(req, res) {
  //   try {
  //     const notifications = await this.service.getUserNotifications(
  //       req.user.id
  //     );
  //     res.json(notifications);
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }

  async markAsRead(req, res) {
    try {
      const notification = await this.service.markAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteNotification(req, res) {
    try {
      await this.service.deleteNotification(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// module.exports = NotificationController;
module.exports = new NotificationController();
