const User = require("../models/user");
const setUserInfo = require("../helpers").setUserInfo;
const ROLE_BLOCK = require("../constants").ROLE_BLOCK;
const Token = require("../models/token");

//= =======================================
// User Routes
//= =======================================
exports.viewProfile = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    let user = await User.findById(userId)
    const userToReturn = setUserInfo(user);
    return res.status(200).json({ user: userToReturn });
  } catch (err) {
    return next(err);
  }
};

exports.getUserSession = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id)
    const userToReturn = setUserInfo(user);
    return res.status(200).json({ user: userToReturn });
  } catch (err) {
    return next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    let profile = req.body.profile;
    delete profile.email;
    delete profile.username;
    await User.findByIdAndUpdate(
      req.user._id,
      {
        profile,
      },
      {
        new: true,
      }
    );
    let user = await User.findById(req.user._id)
    res.send({ user });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

exports.deleteProfile = (req, res, next) => {
  User.deleteOne({ _id: req.params.userId }).exec((err, user) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({
      user,
    });
  });
};

exports.blockUser = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      role: ROLE_BLOCK,
    });
    let user = await User.findById(req.params.id);
    res.send({ user });
  } catch (err) {
    return next(err);
  }
};

exports.listSimpleParticipants = async (req, res, next) => {
  try {
    let users = await User.find({ role: { $ne: ROLE_BLOCK } }, "_id profile");
    return res.status(201).json({
      participants: users,
    });
  } catch (err) {
    return next(err);
  }
};

exports.adminListUnverifiedParticipants = async (req, res, next) => {
  try {
    let users = await User.find(
      { verified: { $ne: true } },
      "_id profile email"
    );
    return res.status(201).json({
      participants: users,
    });
  } catch (err) {
    return next(err);
  }
};

exports.adminVerifyParticipant = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      verified: true,
    });
    let user = await User.findById(req.params.id);
    res.send({ user });
  } catch (err) {
    return next(err);
  }
};

exports.inviteVerifyUser = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const t = await Token.findOne({ token });
    if (!t) {
      res.status(201).json({
        message: "Invalid token",
      });
      return;
    }
    let user = await User.findById(t._userId);
    user.password = password;
    await user.save();
    await Token.deleteMany({ token });
    return res.status(200).json({
      message:
        "Password updated successfully. Please login with your new password.",
    });
  } catch (err) {
    return next(err);
  }
};
