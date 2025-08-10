const express = require("express");
const MessageController = require("../controllers/MessageController");

const router = express.Router();
const messageController = new MessageController();

// Webhook endpoint for processing WhatsApp payloads
router.post("/webhook", messageController.processWebhook);

// Get all conversations
router.get("/conversations", messageController.getAllConversations);

// Get specific conversation messages
router.get("/conversations/:waId", messageController.getConversation);

// Send a new message
router.post("/send", messageController.sendMessage);

// Mark conversation as read
router.put("/conversations/:waId/read", messageController.markAsRead);

module.exports = router;
