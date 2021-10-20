// Importing Node packages required for schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//= ===============================
// Faq Schema
//= ===============================
const FaqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
    },
    order: {
      type: Number,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Faq", FaqSchema);
