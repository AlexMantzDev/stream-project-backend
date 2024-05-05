import { Document, model, Schema, Types } from "mongoose";

export interface IToken extends Document {
	refreshToken: string;
	ip: string;
	userAgent: string;
	isValid: boolean;
	user: object;
}

const TokenSchema = new Schema<IToken>(
	{
		refreshToken: { type: String, required: true },
		ip: { type: String, required: true },
		userAgent: { type: String, required: true },
		isValid: { type: Boolean, default: true },
		user: {
			type: Types.ObjectId,
			ref: "User",
			required: true
		}
	},
	{ timestamps: true }
);

export const Token = model<IToken>("Token", TokenSchema);
