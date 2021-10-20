const FieldData = require("../models/fielddata");

exports.createFieldData = (req, res, next) => {
  const fieldData = new FieldData(req.body);
  fieldData.save((err, fd) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({
      fieldData: fd,
    });
  });
};

exports.listFieldData = (req, res, next) => {
  FieldData.find({}).sort({"value": 1}).exec((err, fds) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({
      fieldData: fds,
    });
  });
};

exports.deleteFieldData = (req, res, next) => {
  FieldData.deleteOne({ _id: req.params.id }).exec((err, fd) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({
      fielddata: fd,
    });
  });
};

exports.setMentorData = async (req, res, next) => {
  try {
    let mentorData = await FieldData.findOneAndUpdate(
      { field: "mentor" },
      { value: req.body.mentor },
      { new: true }
    );
    res.send({ mentor: mentorData });
  } catch (err) {
    return next(err);
  }
};

exports.setSummaryData = async (req, res, next) => {
  try {
    let summaryData = await FieldData.findOneAndUpdate(
      { field: "summary" },
      { value: req.body.summary },
      { new: true }
    );
    res.send({ summary: summaryData });
  } catch (err) {
    return next(err);
  }
};

exports.updateFieldData = async (req, res, next) => {
  try {
    let fieldData = await FieldData.findOneAndUpdate(
      { field: req.body.field },
      { value: req.body.value },
      { new: true }
    );
    res.send({ fieldData });
  } catch (err) {
    return next(err);
  }
};
