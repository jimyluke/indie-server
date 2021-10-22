// Importing Node packages required for schema
const mongoose = require("mongoose");
const ROLE_CREATOR = require("../constants").ROLE_CREATOR;
const ROLE_CINER = require("../constants").ROLE_CINER;
const ROLE_BLOCK = require("../constants").ROLE_BLOCK;
const ROLE_ADMIN = require("../constants").ROLE_ADMIN;
const Schema = mongoose.Schema;
const translateP = require("../helpers").translateP;

//= ===============================
// User Schema
//= ===============================
const UserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      // required: true,
    },
    username: {
      type: String,
      lowercase: true,
      // unique: true,
      required: true,
    },
    profile: {
      full_name: { type: String, required: true },
      dob: { type: String },
      photo: { type: String },
      location: { type: String },
      language: { type: String },
      pronouns: { type: String },
      bio: { type: String },
      twitter: { type: String },
      youtube: { type: String },
      instagram: { type: String },
      tags: [{ type: Schema.Types.ObjectId, ref: "FieldData" }],
      films: { type: String },
      genre: { type: String },
      credit: { type: String },
      recent_films: [
        {
          film: { type: String },
          date: { type: String },
        },
      ],
    },
    authType: {
      type: String,
      enum: ["local", "google", "facebook", "twitter"],
      default: "local",
    },
    authGoogleID: {
      type: String,
      default: null,
    },
    authFbID: {
      type: String,
      default: null,
    },
    authTwitterID: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: [ROLE_CINER, ROLE_CREATOR, ROLE_BLOCK, ROLE_ADMIN],
      default: ROLE_CINER,
    },
    verified: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

//= ===============================
// User ORM Methods
//= ===============================

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = translateP(user.password);
  next();
});

// Method to compare password for login
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  let cp = translateP(candidatePassword);
  let isMatch = cp === this.password;
  cb(null, isMatch);
};

module.exports = mongoose.model("User", UserSchema);
