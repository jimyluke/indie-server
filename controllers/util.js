exports.compareIds = function (id1, id2) {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString()
}