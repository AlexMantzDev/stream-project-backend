"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 32,
        unique: true
    },
    email: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "please use a valid email address"
        ],
        unique: true
    },
    password: {
        type: String,
        required: [true, "please provide a password"],
        minlength: 16
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    verificationToken: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    verified: Date,
    passwordToken: {
        type: String
    },
    passwordTokenExpirationDate: {
        type: Date
    }
});
UserSchema.pre("save", async function (password) {
    if (!this.isModified("password"))
        return;
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(password, salt);
});
UserSchema.methods.comparePass = async function (candidatePass) {
    const isMatch = await bcryptjs_1.default.compare(candidatePass, this.password);
    return isMatch;
};
UserSchema.methods.generateToken = function () {
    const token = jsonwebtoken_1.default.sign({
        id: this._id,
        username: this.username
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
    return token;
};
exports.Users = (0, mongoose_1.model)("User", UserSchema);
//# sourceMappingURL=user.models.js.map