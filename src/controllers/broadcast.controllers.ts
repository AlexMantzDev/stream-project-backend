// IMPORTS
import { Request, Response } from "express";

// CONTROLLERS
export const connectStream = (req: Request, res: Response) => {
	const streamkey: string = req.body.key;
	if (streamkey !== process.env.OBS_SECRET) {
		return res.status(403).send();
	}
	res.status(200).send();
};
