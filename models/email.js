// Importing Node packages required for schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//= ===============================
// Challenge Schema
//= ===============================
const EmailSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Email", EmailSchema);
