"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const mongoose_1 = require("mongoose");
const TokenSchema = new mongoose_1.Schema({
    refreshToken: { type: String, required: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    isValid: { type: Boolean, default: true },
    user: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });
exports.Token = (0, mongoose_1.model)("Token", TokenSchema);
//# sourceMappingURL=token.model.js.map