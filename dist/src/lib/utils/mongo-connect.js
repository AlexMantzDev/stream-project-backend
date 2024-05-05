"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
function connectToMongo(uri) {
    try {
        console.log(`connecting to mongodb database at ${uri} ...`);
        const mongooseConnnection = mongoose_1.default.connect(uri);
        console.log("connected to mongodb.");
        return mongooseConnnection;
    }
    catch (err) {
        console.log(err);
    }
}
exports.connectToMongo = connectToMongo;
//# sourceMappingURL=mongo-connect.js.map