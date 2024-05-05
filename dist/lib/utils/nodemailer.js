"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const nodemailerConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: "clay.hintz@ethereal.email",
        pass: "rrSkVfNZKsrSXSVrdy"
    }
};
const sendEmail = async ({ to, subject, html }) => {
    await nodemailer_1.default.createTestAccount();
    const transporter = nodemailer_1.default.createTransport(nodemailerConfig);
    return transporter.sendEmail({
        from: '"stream-project" <stream-project@email.com>',
        to,
        subject,
        html
    });
};
exports.sendEmail = sendEmail;
const sendVerificationEmail = async ({ username, email, verificationToken, origin }) => {
    const verifyLink = `${origin}/verify?token=${verificationToken}&email=${email}`;
    const message = `<h2>Welcome to Stream Project</h2><p>Thanks for creating an account ${username}. click <a href=${verifyLink} target="_blank">here</a> to verify your email</p>`;
    return (0, exports.sendEmail)({ to: email, subject: "Email Confirmation", html: message });
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=nodemailer.js.map