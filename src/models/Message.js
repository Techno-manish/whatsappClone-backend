const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    waId: {
      type: String,
      required: true,
      index: true,
    },
    contactName: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
    },
    messageBody: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      default: "text",
    },
    timestamp: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    isFromBusiness: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "processed_messages",
  }
);

messageSchema.index({ waId: 1, timestamp: -1 });
// messageSchema.index({ messageId: 1 });

module.exports = mongoose.model("Message", messageSchema);
