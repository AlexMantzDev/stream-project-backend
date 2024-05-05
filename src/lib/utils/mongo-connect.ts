// IMPORTS
import mongoose from "mongoose";

// METHODS
export function connectToMongo(uri) {
	try {
		console.log(`connecting to mongodb database at ${uri} ...`);
		const mongooseConnnection = mongoose.connect(uri);
		console.log("connected to mongodb.");
		return mongooseConnnection;
	} catch (err) {
		console.log(err);
	}
}
