const MessageRepository = require("../repositories/MessageRepository");

class MessageService {
  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async processWebhookPayload(payload) {
    try {
      const entry = payload.metaData?.entry?.[0];
      if (!entry) return null;

      const change = entry.changes?.[0];
      if (!change || change.field !== "messages") return null;

      // Handle status updates
      if (change.value.statuses) {
        return await this.handleStatusUpdate(change.value.statuses[0]);
      }

      // Handle new messages
      if (change.value.messages) {
        return await this.handleNewMessage(change.value);
      }

      return null;
    } catch (error) {
      console.error("Error processing webhook payload:", error);
      throw error;
    }
  }

  async handleStatusUpdate(statusData) {
    const { id, status } = statusData;
    if (!id || !status) return null;

    return await this.messageRepository.updateStatus(id, status);
  }

  async handleNewMessage(messageValue) {
    const message = messageValue.messages[0];
    const contact = messageValue.contacts?.[0];
    const businessNumber = messageValue.metadata?.display_phone_number;

    if (!message || !contact) return null;

    const messageData = {
      messageId: message.id,
      waId: contact.wa_id,
      contactName: contact.profile?.name || "Unknown",
      from: message.from,
      to: businessNumber,
      messageBody: message.text?.body || "",
      messageType: message.type || "text",
      timestamp: parseInt(message.timestamp),
      isFromBusiness: message.from === businessNumber,
      status: "sent",
    };

    // Check if message already exists
    const existingMessage = await this.messageRepository.findById(message.id);
    if (existingMessage) {
      return existingMessage;
    }

    return await this.messageRepository.create(messageData);
  }

  async getAllConversations() {
    return await this.messageRepository.getAllConversations();
  }

  async getConversationByWaId(waId) {
    return await this.messageRepository.findByWaId(waId);
  }

  async sendMessage(waId, messageBody, contactName) {
    const messageData = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      waId,
      contactName,
      from: "918329446654", // Business number
      to: waId,
      messageBody,
      messageType: "text",
      timestamp: Math.floor(Date.now() / 1000),
      isFromBusiness: true,
      status: "sent",
    };

    return await this.messageRepository.create(messageData);
  }

  async markConversationAsRead(waId) {
    return await this.messageRepository.markAsRead(waId);
  }
}

module.exports = MessageService;
