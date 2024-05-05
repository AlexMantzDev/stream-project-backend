// IMPORTS
import dotenv from "dotenv";
import path from "path";
import express, { Express } from "express";
import cors from "cors";
import { startSocketServer } from "./lib/utils/socket-server.js";
// import { router as chatRoutes } from "./routes/chat.routes";
import { router as broadcastRoutes } from "./routes/broadcast.routes.js";
import { connectToMongo } from "./lib/utils/mongo-connect.js";
import { router as authRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

// CONFIG
dotenv.config();

// CONSTANTS
const app: Express = express();
const port = process.env.EXPRESS_PORT || 8080;

// MIDDLEWARE
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
// app.use("/chat", chatRoutes);
app.use("/auth", authRoutes);
app.use("/broadcast", broadcastRoutes);
app.use("/", express.static(path.join(__dirname, "../public/browser")));
app.get("*", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../public/browser/index.html"));
});

// METHODS
async function start() {
	try {
		await connectToMongo(process.env.MONGO_URI);
		app.listen(port, () => {
			console.log(`listening on http://0.0.0.0:${port} ...`);
		});
		// startSocketServer();
	} catch (err) {
		console.log(err);
	}
}

// INIT
start();
