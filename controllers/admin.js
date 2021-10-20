const User = require("../models/user");
const { ROLE_ADMIN, ROLE_BLOCK } = require("../constants");
const setUserInfo = require("../helpers").setUserInfo;

exports.listAdminUsers = async (req, res, next) => {
  try {
    let users = await User.find({ role: { $ne: ROLE_BLOCK } })
      .select("_id email username profile verified role")
    return res.status(201).json({
      participants: users,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    if (req.user.role !== ROLE_ADMIN)
      return res.status(401).send({ error: "You are not super admin user" });
    await User.findByIdAndUpdate(req.params.id, {
      role: req.body.role,
    });
    let user = await User.findById(req.params.id);
    res.send({ user });
  } catch (err) {
    return next(err);
  }
};

exports.getAdminUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    const userToReturn = setUserInfo(user);
    return res.status(200).json({ user: userToReturn });
  } catch (err) {
    return next(err);
  }
};

exports.upateAdminUser = async (req, res, next) => {
  try {
    let profile = req.body.profile;
    let email = profile.email;
    delete profile.email;
    delete profile._id;
    await User.findByIdAndUpdate(req.params.id, {
      profile,
      email,
    });
    let user = await User.findById(req.params.id);
    res.send({ user });
  } catch (err) {
    return next(err);
  }
};

exports.checkIpAddress = (req, res, next) => {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0] ||
    req.connection.remoteAddress;
  return res.status(200).json({ IpAddress: ip });
};
