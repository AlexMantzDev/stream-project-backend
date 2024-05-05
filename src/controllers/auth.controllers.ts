// IMPORTS
import { Users } from "../models/user.models.js";
import { Token } from "../models/token.model.js";
import { Request, Response } from "express";
import crypto, { createHash } from "crypto";
import { sendResetPasswordEmail, sendVerificationEmail } from "../lib/utils/nodemailer.js";
import { attachCookies } from "../lib/utils/jwt.js";

// CONTROLLERS
export const registerUser = async (req: Request, res: Response) => {
	const { email, password1, password2, username } = req.body;

	const emailTaken = await Users.findOne({ email });
	if (emailTaken) {
		return res.status(400).json({
			success: false,
			data: { message: "invalid username or email" }
		});
	}
	const usernameTaken = await Users.findOne({ username });
	if (usernameTaken) {
		return res.status(400).json({
			success: false,
			data: { message: "invalid username or email" }
		});
	}

	const isFirstUser = (await Users.countDocuments({})) === 0;
	const role = isFirstUser ? "admin" : "user";

	const verificationToken = crypto.randomBytes(2 ** 8).toString("hex");

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
	const user = await Users.create({ email, password1, username, role, verificationToken });

	await sendVerificationEmail({
		username: user.username,
		email: user.email,
		verificationToken: user.verificationToken,
		origin: process.env.ORIGIN
	});

	res.status(200).json({ success: true, data: { user } });
};

export const loginUser = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({
			success: false,
			data: { message: "please provide email and password" }
		});
	}
	const user = await Users.findOne({ email });
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

	const existingToken = await Token.findOne({ user: user._id });
	if (existingToken) {
		const { isValid } = existingToken;
		if (!isValid) {
			return res.status(401).json({
				success: false,
				data: { message: "invalid credentials" }
			});
		}
		refreshToken = existingToken.refreshToken;
		attachCookies({ res, user: tokenUser, refreshToken });
		res.status(200).json({ success: true, data: { user: tokenUser } });
		return;
	}

	refreshToken = crypto.randomBytes(40).toString("hex");
	const userAgent = req.headers["user-agent"];
	const ip = req.ip;
	const userToken = { refreshToken, ip, userAgent, user: user._id };

	await Token.create(userToken);

	attachCookies({ res, user: tokenUser, refreshToken });
	res.status(200).json({ success: true, data: { user: tokenUser } });
};

export const logoutUser = async (req: Request, res: Response) => {
	await Token.findOneAndDelete({ user: req.user.userId });
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

export const checkUser = async (req: Request, res: Response) => {
	const { field, param } = req.body;
	switch (field) {
		case "username": {
			if (param === "" || undefined) {
				return res.status(400).json({ message: "invalid field" });
			}
			const usernameTaken = await Users.findOne({ username: param });
			if (usernameTaken) {
				return res.status(400).json({ success: false, data: { message: "taken" } });
			} else {
				return res.status(200).json({ success: true, data: { message: "success" } });
			}
		}

		// case "email": {...}

		default: {
			return res.status(400).json({ message: "invalid field" });
		}
	}
};

export const forgotPass = async (req: Request, res: Response) => {
	const { email } = req.body;
	if (!email) {
		res.status(400).json({ success: false, data: { message: "email not valid" } });
	}
	const user = await Users.findOne({ email });
	if (user) {
		const passwordToken = crypto.randomBytes(70).toString("hex");
		await sendResetPasswordEmail({
			username: user.username,
			email: user.email,
			passwordToken: passwordToken,
			origin: `https://${process.env.ORIGIN}`
		});
		const tenMinutes = 1000 * 60 * 10;
		const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

		user.passwordToken = createHash(passwordToken);
		user.passwordTokenExpirationDate = passwordTokenExpirationDate;
		await user.save();
	}
	res.status(200).json({ success: true, data: { message: "check email for reset link" } });
};

export const resetPass = async (req: Request, res: Response) => {
	const { token, email, password } = req.body;
	if (!token || !email || !password) {
		res.status(400).json({ success: false, data: { message: "please provide all values" } });
	}
	const user = await Users.findOne({ email });
	if (user && user.passwordToken && user.passwordTokenExpirationDate) {
		const currentDate = new Date();
		if (
			user.passwordToken === createHash(token) &&
			user.passwordTokenExpirationDate > currentDate
		) {
			user.password = password;
			user.passwordToken = null;
			user.passwordTokenExpirationDate = null;
			await user.save();
			res.status(200).json({ success: true, data: { message: "password reset success" } });
		} else {
			res.status(400).json({ success: false, data: { message: "invalid token" } });
		}
	} else {
		res.status(400).json({ success: false, data: { message: "please try again" } });
	}
};

export const verifyEmail = async (req: Request, res: Response) => {
	const { verificationToken, email } = req.body;
	const user = await Users.findOne({ email });
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
