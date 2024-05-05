declare namespace Express {
	interface Request {
		user?: any;
	}

	interface Response {
		signedCookies?: any;
	}
}
