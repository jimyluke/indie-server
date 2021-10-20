// Importing Node packages required for schema
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//= ===============================
// Challenge Schema
//= ===============================
const FieldDataSchema = new Schema(
  {
    field: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
    option: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FieldData", FieldDataSchema);
