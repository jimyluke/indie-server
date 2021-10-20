const Faq = require("../models/faq");

exports.createFaq = (req, res, next) => {
  const faq = new Faq(req.body);
  faq.save((err, fd) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({
      faq: fd,
    });
  });
};

exports.updateFaq = async (req, res, next) => {
  const id = req.body._id;
  delete req.body._id;
  try {
    await Faq.findByIdAndUpdate(id, req.body);
    let faq = await Faq.findById(id);
    res.status(201).json({
      faq,
    });
  } catch (err) {
    return next(err);
  }
};

exports.bulkUpdateFaq = async (req, res, next) => {
  const faqs = req.body.faqs;
  try {
    for (let fq of faqs) {
      await Faq.findOneAndUpdate({ _id: fq._id }, { order: fq.order });
    }
    res.status(201).json({
      message: "Update success",
    });
  } catch (err) {
    return next(err);
  }
};

exports.listFaq = (req, res, next) => {
  Faq.find({})
    .sort({ order: 1 })
    .exec((err, fds) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({
        faqs: fds,
      });
    });
};

exports.deleteFaq = (req, res, next) => {
  Faq.deleteOne({ _id: req.params.id }).exec((err, fd) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({
      faq: fd,
    });
  });
};
