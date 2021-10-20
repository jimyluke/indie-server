const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    receptors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    alias: { type: String },
    title: { type: String, required: true },
    body: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    link: { type: String },
    read: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true, // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
