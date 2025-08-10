const Message = require("../models/Message");

class MessageRepository {
  async create(messageData) {
    const message = new Message(messageData);
    return await message.save();
  }

  async findById(messageId) {
    return await Message.findOne({ messageId });
  }

  async updateStatus(messageId, status) {
    return await Message.findOneAndUpdate(
      { messageId },
      { status, updatedAt: new Date() },
      { new: true }
    );
  }

  async findByWaId(waId) {
    return await Message.find({ waId }).sort({ timestamp: 1 });
  }

  async getAllConversations() {
    return await Message.aggregate([
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$waId",
          contactName: { $first: "$contactName" },
          lastMessage: { $first: "$messageBody" },
          lastTimestamp: { $first: "$timestamp" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isFromBusiness", false] },
                    { $ne: ["$status", "read"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          waId: "$_id",
          contactName: 1,
          lastMessage: 1,
          lastTimestamp: 1,
          unreadCount: 1,
          _id: 0,
        },
      },
      {
        $sort: { lastTimestamp: -1 },
      },
    ]);
  }

  async markAsRead(waId) {
    return await Message.updateMany(
      { waId, isFromBusiness: false, status: { $ne: "read" } },
      { status: "read", updatedAt: new Date() }
    );
  }
}

module.exports = MessageRepository;
