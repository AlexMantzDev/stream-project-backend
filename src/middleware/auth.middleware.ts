// IMPORTS
import { isTokenValid } from "../lib/utils/jwt";
import { Token } from "../models/token.model";
import { attachCookies } from "../lib/utils/jwt";

// MIDDLEWARE
export async function authenticateUser(req, res, next) {
	const { refreshToken, accessToken } = req.signedCookies;

	try {
		if (accessToken) {
			const payload = isTokenValid(accessToken);
			req.user = payload.user;
			return next();
		}
		const payload = isTokenValid(refreshToken);
		const existingToken = await Token.findOne({
			user: payload.user.userId,
			refreshToken: payload.refreshToken
		});
		if (!existingToken || !existingToken?.isValid) {
			res.status(401).json({
				success: false,
				data: {
					message: "authentication invalid"
				}
			});
		} else {
			attachCookies({
				res,
				user: payload.user,
				refreshToken: existingToken.refreshToken
			});
			req.user = payload.user;
			next();
		}
	} catch (err) {
		res.status(500).send();
	}
}

export const authorizePermissions = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(401).json({
				success: false,
				data: {
					message: "unauthorized to access this route"
				}
			});
		}
		next();
	};
};
