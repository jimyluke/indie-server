const Conversation = require("../models/conversation"),
  Message = require("../models/message"),
  User = require("../models/user"),
  Notification = require("../models/notification"),
  notification = require("./notification"),
  mongoose = require("mongoose"),
  sockets = require("../socket"),
  utils = require("./util"),
  sendgrid = require("../config/sendgrid");

exports.getConversations = async (req, res, next) => {
  // Only return one message from each conversation to display as snippet
  try {
    let conversations = await Conversation.find({ participants: req.user._id })
      .populate({ path: "participants", select: "_id profile" })
      .sort({ createdAt: "desc" });
    let totalUnread = 0;
    let cvs = [];
    for (cv of conversations) {
      let unread = 0;

      let messages = await Message.find({ conversationId: cv._id })
        .sort("-createdAt")
        .limit(10);
      for (let m of messages) {
        if (
          !utils.compareIds(m._doc.author, req.user._id) &&
          !m._doc.read.includes(req.user._id)
        ) {
          unread++;
        }
      }
      cv._doc.unread = unread;
      totalUnread += unread;
      cvs.push(cv);
    }
    return res.status(200).json({ conversations: cvs, unread: totalUnread });
  } catch (err) {
    res.status(500).send({ error: err });
    return next(err);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    let messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort("-createdAt")
      .limit(10);
    for (let m of messages) {
      if (
        !utils.compareIds(m._doc.author, req.user._id) &&
        !m._doc.read.includes(req.user._id)
      ) {
        m._doc.read.push(req.user._id);
        await m.save();
      }
    }
    messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate({ path: "author", select: "_id profile" });
    return res.status(200).json({ conversation: messages });
  } catch (err) {
    if (err) {
      res.send({ error: err });
      return next(err);
    }
  }
};

exports.newConversation = function (req, res, next) {
  if (!req.params.recipient) {
    res
      .status(422)
      .send({ error: "Please choose a valid recipient for your message." });
    return next();
  }

  if (!req.body.composedMessage) {
    res.status(422).send({ error: "Please enter a message." });
    return next();
  }

  const conversation = new Conversation({
    participants: [req.user._id, req.params.recipient],
  });

  conversation.save((err, newConversation) => {
    if (err) {
      res.send({ error: err });
      return next(err);
    }

    const message = new Message({
      conversationId: newConversation._id,
      body: req.body.composedMessage,
      author: req.user._id,
    });

    message.save((err, newMessage) => {
      if (err) {
        res.send({ error: err });
        return next(err);
      }
      let sent = false;
      const io = sockets.io;
      for (let key in io.sockets.sockets) {
        if (io.sockets.sockets.hasOwnProperty(key)) {
          if (
            utils.compareIds(
              req.params.recipient,
              io.sockets.sockets[key].userId
            )
          ) {
            io.sockets.sockets[key].emit("CREATE_CONVERSATION", {
              message: newMessage,
              conversationId: conversation._id,
            });
            sent = true;
          }
        }
      }
      if (!sent) {
        sendUnreadMessage(
          req.user,
          req.params.recipient,
          req.body.composedMessage
        );
      }
      return res
        .status(200)
        .json({ message: newMessage, conversationId: conversation._id });
    });
  });
};

exports.sendReply = async (req, res, next) => {
  const reply = new Message({
    conversationId: req.params.conversationId,
    body: req.body.composedMessage,
    author: req.user._id,
  });

  try {
    let sentReply = await reply.save();

    sentReply = await Message.populate(sentReply, {
      path: "conversationId author",
      select: "participants _id profile",
    });
    if (!sentReply.conversationId) {
      res.status(400).send({ error: "You are blocked on this channel" });
      return;
    }

    res.status(200).json({ message: "Reply successfully sent!" });

    const io = sockets.io;
    const participants = sentReply.conversationId.participants;
    let receptors = [];
    for (let key in io.sockets.sockets) {
      if (io.sockets.sockets.hasOwnProperty(key)) {
        if (
          participants.some((p) =>
            utils.compareIds(p, io.sockets.sockets[key].userId)
          ) &&
          !utils.compareIds(req.user._id, io.sockets.sockets[key].userId)
        ) {
          io.sockets.sockets[key].emit("NEW_MESSAGE", {
            message: sentReply,
          });
          receptors.push(io.sockets.sockets[key].userId);
        }
      }
    }

    for (let pt of participants) {
      if (!receptors.some((r) => utils.compareIds(r, pt))) {
        sendUnreadMessage(req.user, pt, req.body.composedMessage);
      }
    }

    return;
  } catch (err) {
    res.send({ error: err });
    return next(err);
  }
};

exports.updateMessage = function (req, res, next) {
  Message.findOneAndUpdate(
    { _id: req.body._id },
    { body: req.body.content },
    { new: true },
    (err, ms) => {
      if (err) {
        return next(err);
      }
      Message.populate(
        ms,
        { path: "conversationId author", select: "participants _id profile" },
        (err, sentReply) => {
          const io = sockets.io;
          const participants = sentReply.conversationId.participants;
          for (let key in io.sockets.sockets) {
            if (io.sockets.sockets.hasOwnProperty(key)) {
              if (
                participants.some((p) =>
                  utils.compareIds(p, io.sockets.sockets[key].userId)
                ) &&
                !utils.compareIds(req.user._id, io.sockets.sockets[key].userId)
              ) {
                io.sockets.sockets[key].emit("UPDATE_MESSAGE", {
                  message: sentReply,
                });
              }
            }
          }
        }
      );
      return res.status(200).json({ message: "Message successfully updated!" });
    }
  );
};

exports.deleteMessage = async (req, res, next) => {
  try {
    ms = await Message.findById(req.params.messageId).populate({
      path: "conversationId author",
      select: "participants _id profile",
    });
    await Message.deleteOne({ _id: req.params.messageId });

    const io = sockets.io;
    const participants = ms.conversationId.participants;
    for (let key in io.sockets.sockets) {
      if (io.sockets.sockets.hasOwnProperty(key)) {
        if (
          participants.some((p) =>
            utils.compareIds(p, io.sockets.sockets[key].userId)
          ) &&
          !utils.compareIds(req.user._id, io.sockets.sockets[key].userId)
        ) {
          io.sockets.sockets[key].emit("UPDATE_MESSAGE", {
            message: ms,
          });
        }
      }
    }
    return res.status(200).json({ message: "Message successfully delete!" });
  } catch (err) {
    return next(err);
  }
};

exports.createTeamChat = function (req, res, next) {
  const conversation = new Conversation({
    participants: [req.user._id],
    name: req.body.name,
    project: req.body.projectId,
  });
  conversation.save((err, newConversation) => {
    if (err) {
      res.send({ error: err });
      return next(err);
    }
    return res.status(200).json({ conversationId: newConversation._id });
  });
};

exports.inviteMember = async (req, res, next) => {
  try {
    let conversation = await Conversation.findById(req.params.channelId);
    let newParticipants = [];
    for (let id of req.body.participants) {
      newParticipants.push(mongoose.Types.ObjectId(id));
    }
    await Conversation.updateOne(
      { _id: req.params.channelId },
      { participants: [...conversation.participants, ...newParticipants] }
    );

    let notifTitle = "Group Chat Invitation";
    let notifBody = `You are invited to team chat - ${conversation.name}`;
    let notif = new Notification({
      receptors: newParticipants,
      alias: "invited_members",
      title: notifTitle,
      body: notifBody,
      author: req.user._id,
    });
    notif = await notif.save();

    const io = sockets.io;
    let receptors = [];
    for (let key in io.sockets.sockets) {
      if (io.sockets.sockets.hasOwnProperty(key)) {
        if (
          newParticipants.some((p) =>
            utils.compareIds(p, io.sockets.sockets[key].userId)
          )
        ) {
          io.sockets.sockets[key].emit("NEW_NOTIFICATION", {
            notification: notif,
          });
          receptors.push(io.sockets.sockets[key].userId);
        }
      }
    }
    for (let pt of newParticipants) {
      if (!receptors.some((r) => utils.compareIds(r, pt._id))) {
        let receptor = await User.findById(pt);
        notification.sendNotificationMail(
          req.user,
          receptor,
          notifTitle,
          notifBody
        );
      }
    }
    return res.status(200).json({ conversationId: conversation._id });
  } catch (err) {
    res.send({ error: err });
    return next(err);
  }
};

const sendUnreadMessage = async (sender, receptId, content) => {
  if (utils.compareIds(sender._id, receptId)) return;
  try {
    let receptor = await User.findById(receptId);
    if (!receptor) return;
    let senderName = sender.profile.full_name;
    let receptorName = receptor.profile.full_name;
    sendgrid.newMessage(receptorName, senderName, content, receptor.email);
  } catch (err) {
    console.log(err);
    return;
  }
};

exports.blockChat = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.userid);
    let blockers = user.blockers || [];
    blockers.push(req.user._id);
    await User.findByIdAndUpdate(req.params.userid, {
      blockers,
    });
    let conversation = await Conversation.findOne({
      $or: [
        { participants: [req.params.userid, req.user._id] },
        { participants: [req.user._id, req.params.userid] },
      ],
    });
    await Message.deleteMany({ conversationId: conversation._id });
    await Conversation.deleteOne({ _id: conversation._id });
    res.send({ message: "User blocked successfully" });
  } catch (err) {
    return next(err);
  }
};

exports.getOneConversation = async (req, res, next) => {
  try {
    let conversation = await Conversation.findOne({
      $or: [
        { participants: [req.params.userid, req.user._id] },
        { participants: [req.user._id, req.params.userid] },
      ],
    });
    res.send({ conversation });
  } catch (err) {
    return next(err);
  }
};
