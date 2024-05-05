"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSocketServer = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const httpServer = (0, http_1.createServer)();
const httpServerSettings = {
    cors: {
        origin: process.env.NODE_ENV === "production"
            ? false
            : ["http//localhost:5000", "http://127.0.0.1:5000"]
    }
};
const io = new socket_io_1.Server(httpServer, httpServerSettings);
function startSocketServer() {
    io.on("connection", (socket) => {
        console.log(`User ${socket.id} connected`);
        socket.on("message", (data) => {
            console.log(data);
            io.emit("message", `${socket.id.substring(0, 5)}: ${data}`);
        });
    });
    httpServer.listen(3500, () => {
        console.log("socket.io listening on port 3500...");
    });
}
exports.startSocketServer = startSocketServer;
//# sourceMappingURL=socket-server.js.map