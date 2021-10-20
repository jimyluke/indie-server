const Comment = require("../models/comment");

exports.createComment = (req, res, next) => {
  const comment = new Comment({
    project: req.body.projectId,
    participant: req.user._id,
    content: req.body.content,
  });
  if (req.body.parent) {
    comment.parent = req.body.parent
  }
  comment.save((err, cm) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({ comment: cm });
  });
};

exports.createChallengeComment = (req, res, next) => {
  const comment = new Comment({
    challenge: req.body.challengeId,
    participant: req.user._id,
    content: req.body.content,
  });
  if (req.body.parent) {
    comment.parent = req.body.parent
  }
  comment.save((err, cm) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({ comment: cm });
  });
};

exports.updateComment = (req, res, next) => {
  Comment.findOneAndUpdate(
    { _id: req.body._id },
    { content: req.body.content },
    { new: true },
    (err, cm) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({ comment: cm });
    }
  );
};

exports.listComment = (req, res, next) => {
  Comment.find({ project: req.params.projectId })
    .populate("participant")
    .exec((err, cms) => {
    if (err) {
      return next(err);
    }
    for (let i= cms.length-1; i >= 0; i--) {
      if (!cms[i].participant) {
        cms.splice(i, 1)
      } else {
        delete cms[i].participant.email
      }
    }
    res.status(201).json({ comments: cms });
  });
};

exports.listChallengeComment = (req, res, next) => {
  Comment.find({ challenge: req.params.challengeId })
    .populate("participant")
    .exec((err, cms) => {
    if (err) {
      return next(err);
    }
    for (let i= cms.length-1; i >= 0; i--) {
      if (!cms[i].participant) {
        cms.splice(i, 1)
      } else {
        delete cms[i].participant.email
      }
    }
    res.status(201).json({ comments: cms });
  });
};

exports.deleteComment = (req, res, next) => {
  Comment.deleteOne({ _id: req.params.commentId }).exec((err, cm) => {
    if (err) {
      return next(err);
    }
    res.status(201).json({ comment: cm });
  });
};

exports.likeComment = (req, res, next) => {
  Comment.findById(req.params.commentId, (err, comment) => {
    if (err) {
      return next(err);
    }
    if (req.body.like === true) {
      if (comment.likes.includes(req.user._id)) {
        comment.likes.splice(comment.likes.indexOf(req.user._id), 1)
      } else {
        comment.likes.push(req.user._id)
        if (comment.dislikes.includes(req.user._id)) {
          comment.dislikes.splice(comment.dislikes.indexOf(req.user._id), 1)
        }
      }
    } else {
      if (comment.dislikes.includes(req.user._id)) {
        comment.dislikes.splice(comment.dislikes.indexOf(req.user._id), 1)
      } else {
        comment.dislikes.push(req.user._id)
        if (comment.likes.includes(req.user._id)) {
          comment.likes.splice(comment.likes.indexOf(req.user._id), 1)
        }
      }
    }
    comment.save((err, cm) => {
      if (err) {
        return next(err);
      }
      res.status(201).json({ comment: cm });
    })
  })
};
