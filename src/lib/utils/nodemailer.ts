import nodemailer from "nodemailer";
import { nodemailerConfig } from "./nodemailer-config";

export const sendEmail = async ({ to, subject, html }) => {
	await nodemailer.createTestAccount();
	const transporter = nodemailer.createTransport(nodemailerConfig);
	return transporter.sendEmail({
		from: '"stream-project" <stream-project@email.com>',
		to,
		subject,
		html
	});
};

export const sendVerificationEmail = async ({ username, email, verificationToken, origin }) => {
	const verifyLink = `https://${origin}/verify?token=${verificationToken}&email=${email}`;
	const message = `<h2>Welcome to Stream Project</h2><p>Thanks for creating an account ${username}. click <a href=${verifyLink} target="_blank">here</a> to verify your email</p>`;
	return sendEmail({ to: email, subject: "Email Confirmation", html: message });
};

export const sendResetPasswordEmail = async ({ username, email, passwordToken, origin }) => {
	const resetLink = `https://${origin}/user/reset-password?token=${passwordToken}&email=${email}`;
	const message = `<h2>Reset Password</h2><p>${username}, Please click on the following link to reset your password.</p><br /><p><a href=${resetLink} target="_blank">Reset Password</a> to verify your email</p>`;
	return sendEmail({ to: email, subject: "Password Reset", html: message });
};
