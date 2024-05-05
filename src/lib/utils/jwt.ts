import jwt from "jsonwebtoken";

export const createJWT = ({ payload }) => {
	const token = jwt.sign(payload, process.env.JWT_SECRET);
	return token;
};

export const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const attachCookies = ({ res, user, refreshToken }) => {
	const accessTokenJWT = createJWT({ payload: { user } });
	const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

	const oneHour = 1000 * 60 * 60;
	const oneDay = 1000 * 60 * 60 * 24;

	res.cookie("accessToken", accessTokenJWT, {
		httpOnly: true,
		expires: new Date(Date.now() + oneHour),
		secure: process.env.NODE_ENV === "production",
		signed: true
	});

	res.cookie("refreshToken", refreshTokenJWT, {
		httpOnly: true,
		expires: new Date(Date.now() + oneDay),
		secure: process.env.NODE_ENV === "production",
		signed: true
	});
};
