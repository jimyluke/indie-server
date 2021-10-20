const Report = require("../models/report");

//= =======================================
// Report Route
//= =======================================
exports.createReport = (req, res, next) => {
  const report = new Report({
    target: req.params.userid,
    text: req.body.text,
    author: req.user._id,
  });
  report.save((err, chl) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({
      report: chl,
    });
  });
};

exports.getReports = async (req, res, next) => {
  try {
    let reports = await Report.find({})
      .populate({ path: "target", select: "_id profile" })
      .populate({ path: "author", select: "_id profile" })
      .sort({ createdAt: "desc" })
      .limit(10);

    let result = [];
    for (let rp of reports) {
      if (rp.target && rp.author) result.push(rp);
    }
    res.status(201).json({
      reports: result,
    });
  } catch (error) {
    return next(err);
  }
};

exports.resolveReport = async (req, res, next) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, {
      resolved: true,
    });
    let report = await Report.findById(req.params.id);
    res.send({ report });
  } catch (error) {
    return next(err);
  }
};
