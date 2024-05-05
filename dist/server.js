"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const broadcast_routes_js_1 = require("./routes/broadcast.routes.js");
const mongo_connect_js_1 = require("./lib/utils/mongo-connect.js");
const auth_routes_js_1 = require("./routes/auth.routes.js");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.EXPRESS_PORT || 8080;
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/auth", auth_routes_js_1.router);
app.use("/broadcast", broadcast_routes_js_1.router);
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../public/browser")));
async function start() {
    try {
        await (0, mongo_connect_js_1.connectToMongo)(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`listening on http://0.0.0.0:${port} ...`);
        });
    }
    catch (err) {
        console.log(err);
    }
}
start();
//# sourceMappingURL=server.js.map