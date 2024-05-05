import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const httpServerSettings = {
	cors: {
		origin:
			process.env.NODE_ENV === "production"
				? false
				: ["http//localhost:5000", "http://127.0.0.1:5000"]
	}
};
const io = new Server(httpServer, httpServerSettings);

export function startSocketServer() {
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
