const ROLE_CINER = require("./constants").ROLE_CINER;
const ROLE_CREATOR = require("./constants").ROLE_CREATOR;
const ROLE_BLOCK = require("./constants").ROLE_BLOCK;
const ROLE_ADMIN = require("./constants").ROLE_ADMIN;
const crypto = require("crypto");
const iv = "1287cfd558f2523d00f12ba343e99c73";

// Set user info from request
exports.setUserInfo = function setUserInfo(request) {
  return {
    _id: request._id,
    profile: request.profile,
    email: request.email,
    username: request.username,
    role: request.role,
    verified: request.verified,
  };
};

exports.getRole = function getRole(checkRole) {
  let role;

  switch (checkRole) {
    case ROLE_ADMIN:
      role = 0;
      break;
    case ROLE_BLOCK:
      role = 4;
      break;
    case ROLE_CINER:
      role = 1;
      break;
    case ROLE_CREATOR:
      role = 2;
      break;
    default:
      role = 1;
  }

  return role;
};

exports.translateP = function translateP(pstr) {
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(iv),
    Buffer.from(iv, "hex")
  );
  let encrypted = cipher.update(pstr);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
};
