var sockets = {};
sockets.init = function (server) {
  sockets.io = require("socket.io").listen(server);
  sockets.io.set("origins", "*:*");

  sockets.io.on("connection", (socket) => {
    socket.on("SET_USERID", (data) => {
      socket.userId = data.userId;
    });
  });
};

module.exports = sockets;
