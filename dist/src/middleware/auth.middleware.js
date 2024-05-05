"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizePermissions = exports.authenticateUser = void 0;
const jwt_1 = require("../lib/utils/jwt");
const token_model_1 = require("../models/token.model");
const jwt_2 = require("../lib/utils/jwt");
async function authenticateUser(req, res, next) {
    const { refreshToken, accessToken } = req.signedCookies;
    try {
        if (accessToken) {
            const payload = (0, jwt_1.isTokenValid)(accessToken);
            req.user = payload.user;
            return next();
        }
        const payload = (0, jwt_1.isTokenValid)(refreshToken);
        const existingToken = await token_model_1.Token.findOne({
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
        }
        else {
            (0, jwt_2.attachCookies)({
                res: Response,
                user: payload.user,
                refreshToken: existingToken.refreshToken
            });
            req.user = payload.user;
            next();
        }
    }
    catch (err) {
        res.status(500).send();
    }
}
exports.authenticateUser = authenticateUser;
const authorizePermissions = (...roles) => {
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
exports.authorizePermissions = authorizePermissions;
//# sourceMappingURL=auth.middleware.js.map