const sgMail = require("@sendgrid/mail");
const ejs = require("ejs");
const fs = require("fs");
require("dotenv/config");

sgMail.setApiKey(process.env.SENDGRID_APIKEY);
const mainURL = "http://indiesparxs.com";

exports.userEmailVerification = function userEmailVerification(
  recipient,
  name,
  token
) {
  const msg = {
    to: recipient,
    from: "support@sparxsstudio.com",
    subject: "Participant Email Verification",
    html: userEVFactory(recipient, name, token),
  };
  sgMail.send(msg).catch((err) => {
    console.log(err);
  });
};

exports.userForgotPasword = function userForgotPasword(recipient, token) {
  const msg = {
    to: recipient,
    from: "support@sparxsstudio.com",
    subject: "Participant Reset Password",
    html: userFPFactory(token),
  };
  sgMail.send(msg).catch((err) => {
    console.log(err);
  });
};

exports.newMessage = function newMessage(name, sender, content, email) {
  const msg = {
    to: email,
    from: "support@sparxsstudio.com",
    subject: "You have unread messages",
    html: messageFactory(name, sender, content),
  };
  sgMail.send(msg).catch((err) => {
    console.log(err);
  });
};

exports.newNotification = function newNotification(
  email,
  title,
  content,
  senderName,
  senderPhoto
) {
  const msg = {
    to: email,
    from: "support@sparxsstudio.com",
    subject: senderName,
    html: notificationFactory(title, content, senderName, senderPhoto),
  };
  sgMail.send(msg).catch((err) => {
    console.log(err);
  });
};

function userEVFactory(recipient, name, token) {
  const link = `${mainURL}/email-verify/user/${token}`;
  const mailData = { recipient, name, link };
  const template = fs.readFileSync("template/UserEV.html", {
    encoding: "utf-8",
  });
  var text = ejs.render(template, mailData);
  return text;
}

function userFPFactory(token) {
  const link = `${mainURL}/reset-password/user/${token}`;
  const mailData = { link };
  const template = fs.readFileSync("template/UserFP.html", {
    encoding: "utf-8",
  });
  var text = ejs.render(template, mailData);
  return text;
}

function messageFactory(name, sender, content) {
  const mailData = { name, sender, content };
  const template = fs.readFileSync("template/Message.html", {
    encoding: "utf-8",
  });
  var text = ejs.render(template, mailData);
  return text;
}

function notificationFactory(title, content, senderName, senderPhoto) {
  const mailData = { title, content, senderName, senderPhoto };
  const template = fs.readFileSync("template/Notification.html", {
    encoding: "utf-8",
  });
  var text = ejs.render(template, mailData);
  return text;
}

exports.userEVFactory = userEVFactory;
exports.userFPFactory = userFPFactory;
exports.messageFactory = messageFactory;
exports.notificationFactory = notificationFactory;
