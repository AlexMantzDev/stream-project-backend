"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectStream = void 0;
const connectStream = (req, res) => {
    const streamkey = req.body.key;
    if (streamkey !== process.env.OBS_SECRET) {
        return res.status(403).send();
    }
    res.status(200).send();
};
exports.connectStream = connectStream;
//# sourceMappingURL=broadcast.controllers.js.map