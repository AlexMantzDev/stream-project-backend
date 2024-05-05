"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailer_config_1 = require("./nodemailer-config");
const sendEmail = async ({ to, subject, html }) => {
    await nodemailer_1.default.createTestAccount();
    const transporter = nodemailer_1.default.createTransport(nodemailer_config_1.nodemailerConfig);
    return transporter.sendEmail({
        from: '"stream-project" <stream-project@email.com>',
        to,
        subject,
        html
    });
};
exports.sendEmail = sendEmail;
const sendVerificationEmail = async ({ username, email, verificationToken, origin }) => {
    const verifyLink = `https://${origin}/verify?token=${verificationToken}&email=${email}`;
    const message = `<h2>Welcome to Stream Project</h2><p>Thanks for creating an account ${username}. click <a href=${verifyLink} target="_blank">here</a> to verify your email</p>`;
    return (0, exports.sendEmail)({ to: email, subject: "Email Confirmation", html: message });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendResetPasswordEmail = async ({ username, email, passwordToken, origin }) => {
    const resetLink = `https://${origin}/user/reset-password?token=${passwordToken}&email=${email}`;
    const message = `<h2>Reset Password</h2><p>${username}, Please click on the following link to reset your password.</p><br /><p><a href=${resetLink} target="_blank">Reset Password</a> to verify your email</p>`;
    return (0, exports.sendEmail)({ to: email, subject: "Password Reset", html: message });
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
//# sourceMappingURL=nodemailer.js.map