const MessageService = require("../services/MessageService");

class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  processWebhook = async (req, res) => {
    try {
      const payload = req.body;
      const result = await this.messageService.processWebhookPayload(payload);

      if (result) {
        // Emit real-time update if Socket.IO is available
        if (req.io) {
          req.io.emit("message_update", result);
        }
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getAllConversations = async (req, res) => {
    try {
      const conversations = await this.messageService.getAllConversations();
      res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  getConversation = async (req, res) => {
    try {
      const { waId } = req.params;
      const messages = await this.messageService.getConversationByWaId(waId);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  sendMessage = async (req, res) => {
    try {
      const { waId, messageBody, contactName } = req.body;

      if (!waId || !messageBody) {
        return res.status(400).json({
          success: false,
          error: "waId and messageBody are required",
        });
      }

      const message = await this.messageService.sendMessage(
        waId,
        messageBody,
        contactName
      );

      // Emit real-time update if Socket.IO is available
      if (req.io) {
        req.io.emit("new_message", message);
      }

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

  markAsRead = async (req, res) => {
    try {
      const { waId } = req.params;
      await this.messageService.markConversationAsRead(waId);

      // Emit real-time update if Socket.IO is available
      if (req.io) {
        req.io.emit("messages_read", { waId });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Mark as read error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
}

module.exports = MessageController;
