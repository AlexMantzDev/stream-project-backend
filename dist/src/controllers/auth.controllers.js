"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.resetPass = exports.forgotPass = exports.checkUser = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const user_models_js_1 = require("../models/user.models.js");
const token_model_js_1 = require("../models/token.model.js");
const crypto_1 = __importStar(require("crypto"));
const nodemailer_js_1 = require("../lib/utils/nodemailer.js");
const jwt_js_1 = require("../lib/utils/jwt.js");
const registerUser = async (req, res) => {
    const { email, password1, password2, username } = req.body;
    const emailTaken = await user_models_js_1.Users.findOne({ email });
    if (emailTaken) {
        return res.status(400).json({
            success: false,
            data: { message: "invalid username or email" }
        });
    }
    const usernameTaken = await user_models_js_1.Users.findOne({ username });
    if (usernameTaken) {
        return res.status(400).json({
            success: false,
            data: { message: "invalid username or email" }
        });
    }
    const isFirstUser = (await user_models_js_1.Users.countDocuments({})) === 0;
    const role = isFirstUser ? "admin" : "user";
    const verificationToken = crypto_1.default.randomBytes(2 ** 8).toString("hex");
    if (!email || !password1 || !password2 || !username) {
        return res.status(400).json({
            success: false,
            data: { message: "invalid form submission" }
        });
    }
    if (password1 !== password2) {
        return res.status(400).json({
            success: false,
            data: { message: "passwords do not match" }
        });
    }
    const user = await user_models_js_1.Users.create({ email, password1, username, role, verificationToken });
    await (0, nodemailer_js_1.sendVerificationEmail)({
        username: user.username,
        email: user.email,
        verificationToken: user.verificationToken,
        origin: process.env.ORIGIN
    });
    res.status(200).json({ success: true, data: { user } });
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            data: { message: "please provide email and password" }
        });
    }
    const user = await user_models_js_1.Users.findOne({ email });
    if (!user) {
        return res.status(401).json({
            success: false,
            data: { message: "invalid username or password" }
        });
    }
    const isPassCorrect = await user.comparePass(password);
    if (!isPassCorrect) {
        return res.status(401).json({
            success: false,
            data: { message: "invalid username or password" }
        });
    }
    if (!user.isVerified) {
        return res.status(401).json({
            success: false,
            data: { message: "user account requires email verification" }
        });
    }
    const tokenUser = { name: user.username, userId: user._id, role: user.role };
    let refreshToken = "";
    const existingToken = await token_model_js_1.Token.findOne({ user: user._id });
    if (existingToken) {
        const { isValid } = existingToken;
        if (!isValid) {
            return res.status(401).json({
                success: false,
                data: { message: "invalid credentials" }
            });
        }
        refreshToken = existingToken.refreshToken;
        (0, jwt_js_1.attachCookies)({ res, user: tokenUser, refreshToken });
        res.status(200).json({ success: true, data: { user: tokenUser } });
        return;
    }
    refreshToken = crypto_1.default.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const userToken = { refreshToken, ip, userAgent, user: user._id };
    await token_model_js_1.Token.create(userToken);
    (0, jwt_js_1.attachCookies)({ res, user: tokenUser, refreshToken });
    res.status(200).json({ success: true, data: { user: tokenUser } });
};
exports.loginUser = loginUser;
const logoutUser = async (req, res) => {
    await token_model_js_1.Token.findOneAndDelete({ user: req.user.userId });
    res.cookie("accessToken", "logout", {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.cookie("refreshToken", "logout", {
        httpOnly: true,
        expires: new Date(Date.now())
    });
    res.status(200).json({ success: true, data: { message: "user logged out" } });
};
exports.logoutUser = logoutUser;
const checkUser = async (req, res) => {
    const { field, param } = req.body;
    switch (field) {
        case "username": {
            if (param === "" || undefined) {
                return res.status(400).json({ message: "invalid field" });
            }
            const usernameTaken = await user_models_js_1.Users.findOne({ username: param });
            if (usernameTaken) {
                return res.status(400).json({ success: false, data: { message: "taken" } });
            }
            else {
                return res.status(200).json({ success: true, data: { message: "success" } });
            }
        }
        default: {
            return res.status(400).json({ message: "invalid field" });
        }
    }
};
exports.checkUser = checkUser;
const forgotPass = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ success: false, data: { message: "email not valid" } });
    }
    const user = await user_models_js_1.Users.findOne({ email });
    if (user) {
        const passwordToken = crypto_1.default.randomBytes(70).toString("hex");
        await (0, nodemailer_js_1.sendResetPasswordEmail)({
            username: user.username,
            email: user.email,
            passwordToken: passwordToken,
            origin: `https://${process.env.ORIGIN}`
        });
        const tenMinutes = 1000 * 60 * 10;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
        user.passwordToken = (0, crypto_1.createHash)(passwordToken);
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        await user.save();
    }
    res.status(200).json({ success: true, data: { message: "check email for reset link" } });
};
exports.forgotPass = forgotPass;
const resetPass = async (req, res) => {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
        res.status(400).json({ success: false, data: { message: "please provide all values" } });
    }
    const user = await user_models_js_1.Users.findOne({ email });
    if (user && user.passwordToken && user.passwordTokenExpirationDate) {
        const currentDate = new Date();
        if (user.passwordToken === (0, crypto_1.createHash)(token) &&
            user.passwordTokenExpirationDate > currentDate) {
            user.password = password;
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            await user.save();
            res.status(200).json({ success: true, data: { message: "password reset success" } });
        }
        else {
            res.status(400).json({ success: false, data: { message: "invalid token" } });
        }
    }
    else {
        res.status(400).json({ success: false, data: { message: "please try again" } });
    }
};
exports.resetPass = resetPass;
const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body;
    const user = await user_models_js_1.Users.findOne({ email });
    if (!user) {
        return res.status(401).json({
            success: false,
            data: { message: "verification failed" }
        });
    }
    if (user.verificationToken !== verificationToken) {
        return res.status(401).json({
            success: false,
            data: { message: "verification failed" }
        });
    }
    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = "";
    await user.save();
    return res.status(200).json({
        success: true,
        data: { message: "email verified" }
    });
};
exports.verifyEmail = verifyEmail;
//# sourceMappingURL=auth.controllers.js.map